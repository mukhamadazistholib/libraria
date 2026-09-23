# 🚀 Panduan Deployment & Integrasi Backend Libraria (Digital Library)

Panduan ini berisi arsitektur lengkap, konfigurasi berkas, dan instruksi langkah-demi-langkah untuk mendeploy **Libraria** ke infrastruktur cloud modern dengan **Tier 100% Gratisan (Free-tier friendly)** tanpa memerlukan server VPS berbayar.

---

## 1. Arsitektur Tech Stack (100% Gratis & Serverless)

| Komponen | Layanan Cloud Gratis | Alasan & Kuota Free Tier |
| :--- | :--- | :--- |
| **Frontend & API Routes** | **Vercel** (Next.js / Node.js) | Hobby Plan gratis, otomatis CI/CD dari GitHub, dukungan Edge & Serverless Functions. |
| **Database Relasional** | **Supabase** (PostgreSQL) atau **Neon.tech** | Supabase: 500 MB DB + Auth bawaan. Neon: 0.5 GB storage + instant branching gratis. |
| **ORM & Migrations** | **Prisma** | Type-safe query builder, berkas `prisma/schema.prisma` sudah tersedia. |
| **Penyimpanan EPUB** | **Cloudflare R2** | **10 GB gratis** per bulan & **$0 Egress fee** (file EPUB bebas didownload tanpa biaya bandwidth). |
| **Concurrency & Lock** | **Upstash Redis** | 10.000 request/hari gratis. Digunakan untuk *distributed lock* saat peminjaman buku agar tidak terjadi *oversell* stok. |
| **Cron Job (Auto-Return)** | **Vercel Cron** | Trigger harian otomatis pada jam 00:00 untuk mengecek dan mengembalikan buku pinjaman > 30 hari. |
| **Notifikasi Email** | **Resend** | 3.000 email/bulan gratis untuk pengingat jatuh tempo (H-3 dan H-1). |

---

## 2. Persiapan Database (Supabase / Neon & Prisma)

Skema database lengkap telah disediakan di berkas `/prisma/schema.prisma` yang mencakup tabel:
`User`, `Book`, `BookChapter`, `Loan`, `Review`, `Activity`, `BookRequest`, `Shelf`, dan `Follow`.

### Langkah Konfigurasi:
1. Buat proyek baru di [supabase.com](https://supabase.com) atau [neon.tech](https://neon.tech).
2. Salin **Connection String URI** (contoh: `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres?pgbouncer=true`).
3. Jalankan migrasi schema ke database Anda:
   ```bash
   npx prisma migrate dev --name init_libraria
   ```
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

---

## 3. Integrasi Cloudflare R2 (Penyimpanan Aman File EPUB)

File naskah EPUB tidak boleh disimpan di direktori publik agar tidak diakses tanpa status peminjaman aktif. Gunakan **Cloudflare R2** dengan presigned signed URL (berlaku misal 15 menit).

### Konfigurasi Cloudflare R2:
1. Buka dashboard Cloudflare -> R2 -> Buat Bucket bernama `libraria-epubs`.
2. Buat **R2 API Token** dengan izin `Object Read & Write`.
3. Simpan **Account ID**, **Access Key ID**, dan **Secret Access Key**.

### Contoh Endpoint Backend Signed URL (`app/api/books/[id]/stream/route.ts`):
```typescript
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // 1. Verifikasi Session User & Status Pinjaman Aktif
  const userId = req.headers.get("x-user-id");
  const activeLoan = await prisma.loan.findFirst({
    where: { userId, bookId: params.id, status: "ACTIVE" },
  });

  if (!activeLoan) {
    return new Response(JSON.stringify({ error: "Akses ditolak: Buku belum dipinjam" }), { status: 403 });
  }

  // 2. Generate Signed URL sementara (kadaluarsa dalam 15 menit)
  const book = await prisma.book.findUnique({ where: { id: params.id } });
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: book?.epubStorageKey,
  });

  const signedUrl = await getSignedUrl(r2, command, { expiresIn: 900 });
  return Response.json({ streamUrl: signedUrl });
}
```

---

## 4. Distributed Concurrency Lock (Upstash Redis)

Ketika sisa stok buku tinggal `1`, dan ada dua pengguna yang menekan tombol *Pinjam* secara bersamaan dalam milidetik yang sama, distributed lock memastikan tidak ada *race condition*.

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function borrowBookWithLock(userId: string, bookId: string) {
  const lockKey = `lock:book:${bookId}`;
  // Akuisisi lock selama 5 detik
  const acquired = await redis.set(lockKey, userId, { nx: true, ex: 5 });
  
  if (!acquired) {
    throw new Error("Sistem sedang memproses antrean peminjaman buku ini. Coba 2 detik lagi.");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book || book.availableCopies <= 0) {
        throw new Error("Slot peminjaman buku ini telah habis.");
      }

      // Kurangi stok & buat tiket loan
      await tx.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 }, borrowCount: { increment: 1 } },
      });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // Durasi pinjam 30 hari

      return await tx.loan.create({
        data: { userId, bookId, dueDate, status: "ACTIVE" },
      });
    });
  } finally {
    // Lepas lock setelah transaksi selesai
    await redis.del(lockKey);
  }
}
```

---

## 5. Otomasi Auto-Return & Pengingat (Vercel Cron)

Sistem akan otomatis mengecek peminjaman yang telah melewati batas 30 hari setiap malam pada pukul 00:00 UTC.

### Berkas `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-return",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Handler Cron (`app/api/cron/auto-return/route.ts`):
```typescript
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // Verifikasi Bearer token dari Vercel Cron Header
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();

  // 1. Temukan semua pinjaman aktif yang melewati batas dueDate
  const overdueLoans = await prisma.loan.findMany({
    where: { status: "ACTIVE", dueDate: { lt: now } },
  });

  for (const loan of overdueLoans) {
    await prisma.$transaction([
      prisma.loan.update({
        where: { id: loan.id },
        data: { status: "RETURNED", returnedAt: now },
      }),
      prisma.book.update({
        where: { id: loan.bookId },
        data: { availableCopies: { increment: 1 } },
      }),
    ]);
  }

  return Response.json({ success: true, returnedCount: overdueLoans.length });
}
```

---

## 6. Daftar Environment Variables (`.env.production`)

Tambahkan variabel berikut pada panel **Settings -> Environment Variables** di Vercel:

```env
# Database (Supabase / Neon)
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXX..."

# Cloudflare R2 Storage (EPUBs & Cover)
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key"
R2_SECRET_ACCESS_KEY="your_r2_secret_key"
R2_BUCKET_NAME="libraria-epubs"

# Cron Security Secret
CRON_SECRET="generate_random_secret_token_here"

# Auth Secret (NextAuth / JWT)
NEXTAUTH_SECRET="your_nextauth_jwt_secret"
NEXTAUTH_URL="https://libraria.yourdomain.com"
```

---

## 7. Langkah Deploy ke Vercel (Langkah demi Langkah)

1. **Push ke GitHub**:
   Inisialisasi git dan unggah kode ke repositori GitHub pribadi Anda:
   ```bash
   git add .
   git commit -m "feat: complete digital library application"
   git push origin main
   ```
2. **Import ke Vercel**:
   - Masuk ke [vercel.com](https://vercel.com) dengan akun GitHub Anda.
   - Klik **"Add New"** -> **"Project"** -> Pilih repositori GitHub Anda.
   - Framework Preset otomatis mendeteksi **Vite** / **Next.js**.
3. **Masukkan Environment Variables**:
   - Buka bagian *Environment Variables*, paste seluruh variabel dari tabel di atas.
4. **Deploy**:
   - Klik tombol **"Deploy"**. Dalam ~60 detik aplikasi sudah daring dengan SSL/HTTPS gratis dan CDN global!
