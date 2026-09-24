// Script seed data awal untuk database Libraria di Supabase
// Jalankan dengan: npx prisma db seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding data ke Supabase...');

  // 1. Bersihkan tabel lama jika diperlukan (opsional)
  await prisma.activity.deleteMany({});
  await prisma.loan.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.bookChapter.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Buat Pengguna Utama & Admin
  const readerUser = await prisma.user.create({
    data: {
      id: 'usr-1',
      name: 'Mukhamad Azis Tholib',
      handle: 'azis_reader',
      email: 'mukhamadazistholib278@gmail.com',
      role: 'READER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      bio: 'Penikmat kopi tubruk, pencatat kutipan marginal, dan pengembara ide-ide stoikisme & sastra kontemporer.',
      streakDays: 14,
      booksFinished: 18,
      pagesRead: 4320,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: 'usr-admin',
      name: 'Pustakawan Utama',
      handle: 'libraria_admin',
      email: 'admin@libraria.library',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
      bio: 'Kurator koleksi digital Libraria. Mengawasi sirkulasi dan lisensi buku digital perpustakaan.',
      streakDays: 45,
      booksFinished: 52,
      pagesRead: 14500,
    },
  });

  console.log('✅ Pengguna reader & admin berhasil dibuat');

  // 3. Buat Kategori
  const catFilsafat = await prisma.category.create({
    data: { id: 'cat-filsafat', name: 'Filsafat & Pemikiran', slug: 'filsafat' },
  });

  const catFiksi = await prisma.category.create({
    data: { id: 'cat-fiksi', name: 'Fiksi & Sastra', slug: 'fiksi' },
  });

  const catSelfDev = await prisma.category.create({
    data: { id: 'cat-self-dev', name: 'Pengembangan Diri', slug: 'self-dev' },
  });

  console.log('✅ Kategori buku berhasil dibuat');

  // 4. Buat Buku Filosofi Teras beserta Bab-nya
  await prisma.book.create({
    data: {
      id: 'book-1',
      title: 'Filosofi Teras: Panduan Stoikisme Menghadapi Kekhawatiran',
      author: 'Henry Manampiring',
      isbn: '978-602-412-518-9',
      categoryId: catFilsafat.id,
      description: 'Lebih dari 2.000 tahun lalu, sebuah mazhab filsafat menemukan akar masalah dan juga solusi dari emosi negatif. Stoisisme atau Filosofi Teras menekankan pada apa yang berada dalam kendali kita (dikotomi kendali) dan bagaimana merespons hidup secara rasional.',
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      language: 'Bahasa Indonesia',
      publishedYear: 2019,
      pages: 320,
      totalCopies: 4,
      availableCopies: 3,
      rating: 4.8,
      ratingCount: 342,
      borrowCount: 128,
      epubStorageKey: 'books/book-1/filosofi_teras.epub',
      featured: true,
      chapters: {
        create: [
          {
            title: 'Bab 1: Survei Khawatir Nasional',
            readTimeMinutes: 6,
            orderIndex: 1,
            content: '<h3>Prolog: Mengapa Kita Mudah Sekali Resah?</h3><p>Sebuah survei mandiri terhadap lebih dari 2.000 orang di Indonesia menemukan kenyataan mengejutkan: mayoritas dari kita menghabiskan energi harian untuk mengkhawatirkan hal-hal yang belum tentu terjadi.</p><blockquote>"Bukan peristiwa di luar diri yang meremukkan kita, melainkan persepsi kita sendiri terhadap peristiwa tersebut." — Epictetus</blockquote>',
          },
          {
            title: 'Bab 2: Dikotomi Kendali (The Dichotomy of Control)',
            readTimeMinutes: 8,
            orderIndex: 2,
            content: '<h3>Prinsip Dasar Paling Fundamental</h3><p>Epictetus membagi seluruh aspek kehidupan ke dalam dua kotak: hal yang ada di bawah kendali kita dan hal yang TIDAK ada di bawah kendali kita. Ketenangan sejati bermula saat kita berhenti memaksakan kotak kedua.</p>',
          },
        ],
      },
    },
  });

  // 5. Buat Buku Cantik Itu Luka
  await prisma.book.create({
    data: {
      id: 'book-2',
      title: 'Cantik Itu Luka',
      author: 'Eka Kurniawan',
      isbn: '978-602-031-258-3',
      categoryId: catFiksi.id,
      description: 'Di sebuah sore di akhir pekan, Dewi Ayu bangkit dari kuburnya setelah dua puluh satu tahun mati. Kebangkitannya mengawali kisah tragis, epik, dan satiris keluarga perempuannya yang penuh kutukan sejarah di kota fiktif Halimunda.',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
      language: 'Bahasa Indonesia',
      publishedYear: 2002,
      pages: 537,
      totalCopies: 3,
      availableCopies: 2,
      rating: 4.9,
      ratingCount: 890,
      borrowCount: 312,
      epubStorageKey: 'books/book-2/cantik_itu_luka.epub',
      featured: true,
      chapters: {
        create: [
          {
            title: 'Bab 1: Kebangkitan Dewi Ayu',
            readTimeMinutes: 10,
            orderIndex: 1,
            content: '<h3>Sore Hari di Halimunda</h3><p>Sore hari di akhir pekan bulan Maret, Dewi Ayu bangkit dari kuburnya setelah dua puluh satu tahun mati. Angin laut membawakan kabar burung yang segera menyebar ke seluruh penjuru kota kolonial tua itu.</p>',
          },
        ],
      },
    },
  });

  // 6. Buat Buku Atomic Habits
  await prisma.book.create({
    data: {
      id: 'book-3',
      title: 'Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa',
      author: 'James Clear',
      isbn: '978-602-063-317-6',
      categoryId: catSelfDev.id,
      description: 'Perubahan nyata tidak datang dari satu lompatan revolusioner yang dramatis, melainkan akumulasi perbaikan 1% setiap hari. Sistem kebiasaan mikro yang dapat dipelajari siapa pun.',
      coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
      language: 'Bahasa Indonesia',
      publishedYear: 2018,
      pages: 352,
      totalCopies: 5,
      availableCopies: 4,
      rating: 4.9,
      ratingCount: 1420,
      borrowCount: 450,
      epubStorageKey: 'books/book-3/atomic_habits.epub',
      featured: true,
    },
  });

  console.log('✅ Koleksi buku digital berhasil dibuat');

  // 7. Buat Sample Aktivitas Sosial Feed
  await prisma.activity.create({
    data: {
      userId: readerUser.id,
      bookId: 'book-1',
      actionType: 'QUOTED_PASSAGE',
      quote: 'Bukan peristiwa di luar diri yang meremukkan kita, melainkan persepsi kita sendiri terhadap peristiwa tersebut.',
      reviewComment: 'Bab 2 buku ini benar-benar mengubah cara saya memandang kritik di kantor. Sangat direkomendasikan!',
      rating: 5,
    },
  });

  console.log('✨ Seeding database Supabase berhasil diselesaikan!');
}

main()
  .catch((e) => {
    console.error('❌ Gagal melakukan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
