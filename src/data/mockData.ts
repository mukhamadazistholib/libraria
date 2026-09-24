import { Book, Category, User, SocialActivity, BookRequest, Review, SystemSettings, CustomShelf } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-all', name: 'Semua Kategori', slug: 'all' },
  { id: 'cat-filsafat', name: 'Filsafat & Pemikiran', slug: 'filsafat' },
  { id: 'cat-fiksi', name: 'Fiksi & Sastra', slug: 'fiksi' },
  { id: 'cat-self-dev', name: 'Pengembangan Diri', slug: 'self-dev' },
  { id: 'cat-bisnis', name: 'Sains & Bisnis', slug: 'bisnis' },
  { id: 'cat-sejarah', name: 'Sejarah & Biografi', slug: 'sejarah' },
];

export const CURRENT_USER: User = {
  id: 'usr-1',
  name: 'Mukhamad Azis Tholib',
  handle: '@azis_reader',
  email: 'mukhamadazistholib278@gmail.com',
  role: 'reader',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  bio: 'Penikmat kopi tubruk, pencatat kutipan marginal, dan pengembara ide-ide stoikisme & sastra kontemporer.',
  joinedDate: 'Januari 2024',
  streakDays: 14,
  booksFinished: 18,
  pagesRead: 4320,
  followersCount: 142,
  followingCount: 89,
};

export const ADMIN_USER: User = {
  id: 'usr-superadmin',
  name: 'Mukhamad Azis Tholib (Admin)',
  handle: '@azis_admin',
  email: 'mukhamadazistholib278@gmail.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  bio: 'Super Administrator & Kurator Utama Perpustakaan Digital Libraria.',
  joinedDate: 'Januari 2024',
  streakDays: 45,
  booksFinished: 52,
  pagesRead: 14500,
  followersCount: 820,
  followingCount: 15,
};

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'Filosofi Teras: Panduan Stoikisme Menghadapi Kekhawatiran',
    author: 'Henry Manampiring',
    isbn: '978-602-412-518-9',
    categoryId: 'cat-filsafat',
    categoryName: 'Filsafat & Pemikiran',
    description: 'Lebih dari 2.000 tahun lalu, sebuah mazhab filsafat menemukan akar masalah dan juga solusi dari emosi negatif. Stoisisme atau Filosofi Teras menekankan pada apa yang berada dalam kendali kita (dikotomi kendali) dan bagaimana merespons hidup secara rasional.',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    language: 'Bahasa Indonesia',
    publishedYear: 2019,
    pages: 320,
    totalCopies: 4,
    availableCopies: 2,
    rating: 4.8,
    ratingCount: 342,
    borrowCount: 128,
    epubStorageKey: 'books/book-1/filosofi_teras.epub',
    createdAt: '2024-01-10',
    featured: true,
    chapters: [
      {
        id: 'chap-1-1',
        title: 'Bab 1: Survei Khawatir Nasional',
        readTimeMinutes: 6,
        content: `<h3>Prolog: Mengapa Kita Mudah Sekali Resah?</h3>
<p>Sebuah survei mandiri terhadap lebih dari 2.000 orang di Indonesia menemukan kenyataan mengejutkan: mayoritas dari kita menghabiskan energi harian untuk mengkhawatirkan hal-hal yang belum tentu terjadi.</p>
<p>Kekhawatiran soal masa depan karir, finansial, tanggapan orang lain di media sosial, hingga jodoh menyita pikiran dari pagi hingga sebelum terlelap. Namun, apakah kekhawatiran itu mengubah kenyataan?</p>
<blockquote>"Bukan peristiwa di luar diri yang meremukkan kita, melainkan persepsi dan interpretasi kita sendiri terhadap peristiwa tersebut." — Epictetus</blockquote>
<p>Inilah pintu gerbang menuju Stoisisme atau yang di buku ini kita sebut secara ramah sebagai <em>Filosofi Teras</em>.</p>`
      },
      {
        id: 'chap-1-2',
        title: 'Bab 2: Dikotomi Kendali (The Dichotomy of Control)',
        readTimeMinutes: 8,
        content: `<h3>Prinsip Dasar Paling Fundamental</h3>
<p>Epictetus membagi seluruh aspek kehidupan ke dalam dua kotak sederhana:</p>
<ul>
  <li><strong>Kotak 1: Hal yang ada di bawah kendali kita</strong> — Pikiran, niat, tindakan, kata-kata, dan reaksi batin kita sendiri.</li>
  <li><strong>Kotak 2: Hal yang TIDAK ada di bawah kendali kita</strong> — Pendapat orang lain, hasil akhir, cuaca, masa lalu, dan kepastian masa depan.</li>
</ul>
<p>Kegalauan dan frustrasi manusia modern terjadi ketika kita menaruh kebahagiaan dan harga diri kita pada Kotak 2, padahal kita tidak memiliki tombol pengontrolnya.</p>
<p>Fokuskan energimu hanya pada Kotak 1. Bila kamu sudah berusaha maksimal, terimalah apa pun hasil yang tiba dengan lapang dada (Amor Fati).</p>`
      },
      {
        id: 'chap-1-3',
        title: 'Bab 3: Melatih S.T.A.R untuk Menjinakkan Emosi',
        readTimeMinutes: 7,
        content: `<h3>Metode Praktis Menghadapi Pemicu Amarah</h3>
<p>Saat hal yang menjengkelkan menimpamu—misal dipotong kendaraan sembrono atau komentar pedas di kolom postingan—jangan langsung bereaksi. Gunakan jeda <strong>S.T.A.R</strong>:</p>
<ol>
  <li><strong>Stop</strong>: Hentikan respons insting pertama. Tarik napas dalam.</li>
  <li><strong>Think</strong>: Rasionalisasi, apakah ini dalam kendaliku? Apakah orang itu sengaja atau memang sedang ceroboh?</li>
  <li><strong>Assess</strong>: Timbang konsekuensi jika kamu mengamuk versus jika kamu mengabaikannya.</li>
  <li><strong>Respond</strong>: Ambil tindakan dengan kepala dingin dan bermartabat.</li>
</ol>`
      }
    ]
  },
  {
    id: 'book-2',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    isbn: '978-602-424-694-5',
    categoryId: 'cat-fiksi',
    categoryName: 'Fiksi & Sastra',
    description: 'Novel fiksi berlatar tahun 1998 yang bertutur tentang keluarga yang kehilangan, sekumpulan sahabat yang merasakan kekosongan di dada, kelompok yang diburu, dan tentang cinta yang tak pernah padam di dasar samudera.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    language: 'Bahasa Indonesia',
    publishedYear: 2017,
    pages: 379,
    totalCopies: 5,
    availableCopies: 1,
    rating: 4.9,
    ratingCount: 520,
    borrowCount: 215,
    epubStorageKey: 'books/book-2/laut_bercerita.epub',
    createdAt: '2024-01-12',
    featured: true,
    chapters: [
      {
        id: 'chap-2-1',
        title: 'Bagian Pertama: Biru Laut — Dasar Samudera',
        readTimeMinutes: 10,
        content: `<h3>Di Bawah Kaki-Kaki Gelombang</h3>
<p>Mati di dasar samudra sunyi ternyata tidak seperti yang kubayangkan. Air laut begitu pekat dan dingin merasuki paru-paruku yang sempat meronta beberapa detik sebelum akhirnya pasrah.</p>
<p>Kaki dan tanganku terikat pemberat besi. Mereka melempar kami ke palung gelap, berharap suara kami lenyap bersama buih. Namun mereka salah: suara kami tidak pernah karam.</p>
<blockquote>"Bapak, Ibu, dan Asmara... jangan biarkan mereka menghapus nama-nama kami dari lembar ingatan."</blockquote>
<p>Setiap akhir pekan, aroma masakan tenggiri goreng Ibu masih terasa menggelitik hidungku. Ruang makan kami di Solo tak pernah sepi dari tawa, sebelum segalanya menjadi malam panjang yang tak berujung.</p>`
      },
      {
        id: 'chap-2-2',
        title: 'Bagian Kedua: Rumah di Seyegan dan Diskusi Senja',
        readTimeMinutes: 9,
        content: `<h3>Ruang Gerak dan Buku-Buku Terlarang</h3>
<p>Yogyakarta kala itu bergolak dalam bisik-bisik mahasiswa. Di rumah sewaan kecil di Seyegan, kami membaca karya-karya sastra dan risalah buruh yang distempel berbahaya oleh rezim penguasa.</p>
<p>Sunu, Alex, Daniel, Naratama... kami berkumpul melingkar di atas tikar pandan sambil menikmati seduhan jahe panas buatan Kinan. Kami bermimpi tentang negeri di mana petani tidak digusur sewenang-wenang dan suara rakyat tidak dibungkam peluru.</p>`
      }
    ]
  },
  {
    id: 'book-3',
    title: 'Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa',
    author: 'James Clear',
    isbn: '978-602-06-3317-6',
    categoryId: 'cat-self-dev',
    categoryName: 'Pengembangan Diri',
    description: 'Buku fenomenal tentang bagaimana perubahan 1% setiap hari dapat berakumulasi menjadi transformasi hidup raksasa. Menjelaskan 4 hukum perubahan perilaku yang mudah dipraktikkan.',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
    language: 'Bahasa Indonesia',
    publishedYear: 2019,
    pages: 352,
    totalCopies: 6,
    availableCopies: 3,
    rating: 4.8,
    ratingCount: 890,
    borrowCount: 310,
    epubStorageKey: 'books/book-3/atomic_habits.epub',
    createdAt: '2024-01-05',
    featured: true,
    chapters: [
      {
        id: 'chap-3-1',
        title: 'Bab 1: Kekuatan Dahsyat Perubahan 1 Persen',
        readTimeMinutes: 7,
        content: `<h3>Mengapa Kebiasaan Kecil Membuat Perbedaan Besar</h3>
<p>Kita sering meyakinkan diri sendiri bahwa kesuksesan masif membutuhkan tindakan masif. Padahal, jika Anda bisa menjadi 1 persen lebih baik setiap hari selama satu tahun, Anda akan 37 kali lebih baik di akhir tahun.</p>
<p>Sebaliknya, jika Anda tergelincir 1 persen lebih buruk setiap hari selama setahun, Anda akan merosot hampir ke titik nol.</p>
<blockquote>"Anda tidak naik ke tingkat sasaran Anda. Anda jatuh ke tingkat sistem Anda." — James Clear</blockquote>
<p>Fokuslah pada pembentukan identitas: bukan "saya ingin lari maraton", tapi "saya adalah seorang pelari".</p>`
      },
      {
        id: 'chap-3-2',
        title: 'Bab 2: Empat Kaidah Perubahan Perilaku',
        readTimeMinutes: 8,
        content: `<h3>The 4 Laws of Behavior Change</h3>
<p>Untuk membentuk kebiasaan baik:</p>
<ol>
  <li><strong>Hukum ke-1 (Petunjuk)</strong>: Jadikannya Terlihat (Make it obvious).</li>
  <li><strong>Hukum ke-2 (Gairah)</strong>: Jadikannya Menarik (Make it attractive).</li>
  <li><strong>Hukum ke-3 (Tanggapan)</strong>: Jadikannya Mudah (Make it easy).</li>
  <li><strong>Hukum ke-4 (Ganjaran)</strong>: Jadikannya Memuaskan (Make it satisfying).</li>
</ol>`
      }
    ]
  },
  {
    id: 'book-4',
    title: 'Sapiens: Riwayat Singkat Umat Manusia',
    author: 'Yuval Noah Harari',
    isbn: '978-602-424-416-3',
    categoryId: 'cat-sejarah',
    categoryName: 'Sejarah & Biografi',
    description: 'Tujuh puluh ribu tahun lalu, ada setidaknya enam spesies manusia di bumi. Hari ini hanya tersisa satu: kita, Homo sapiens. Bagaimana spesies kera tak berbulu ini mampu menaklukkan planet dan membangun peradaban modern?',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    language: 'Bahasa Indonesia',
    publishedYear: 2014,
    pages: 512,
    totalCopies: 3,
    availableCopies: 0,
    rating: 4.7,
    ratingCount: 410,
    borrowCount: 190,
    epubStorageKey: 'books/book-4/sapiens.epub',
    createdAt: '2024-01-15',
    featured: false,
    chapters: [
      {
        id: 'chap-4-1',
        title: 'Bab 1: Hewan yang Tak Berarti',
        readTimeMinutes: 9,
        content: `<h3>Homo Sapiens di Padang Savana</h3>
<p>Sekitar 2,5 juta tahun lalu di Afrika Timur, manusia purba pertama kali muncul. Selama jutaan tahun, mereka bukan penguasa rantai makanan; mereka adalah makhluk menengah yang kerap memungut sisa mangsa predator besar.</p>
<p>Titik balik dimulai saat Revolusi Kognitif sekitar 70.000 tahun silam, ketika mutasi genetik memungkinkan bahasa dan imajinasi kolektif berkembang pesat.</p>`
      },
      {
        id: 'chap-4-2',
        title: 'Bab 2: Pohon Pengetahuan dan Mitos Bersama',
        readTimeMinutes: 10,
        content: `<h3>Kekuatan Fiksi Kolektif</h3>
<p>Seekor simpanse tidak bisa meyakinkan kawanannya untuk memberinya pisang dengan menjanjikan pisang tak terbatas di surga simpanse setelah mati.</p>
<p>Hanya Homo sapiens yang mampu percaya pada hal-hal abstrak: negara, uang, korporasi, hukum, dan hak asasi manusia. Fiksi bersama inilah perekat jutaan manusia asing untuk bekerja sama.</p>`
      }
    ]
  },
  {
    id: 'book-5',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    isbn: '978-602-06-4782-1',
    categoryId: 'cat-bisnis',
    categoryName: 'Sains & Bisnis',
    description: 'Kesuksesan finansial bukanlah ilmu pasti; ini adalah soft skill di mana cara Anda berperilaku jauh lebih penting daripada apa yang Anda ketahui. Pelajari 19 cerita pendek tentang cara aneh orang memandang uang.',
    coverUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    language: 'Bahasa Indonesia',
    publishedYear: 2020,
    pages: 268,
    totalCopies: 4,
    availableCopies: 2,
    rating: 4.8,
    ratingCount: 630,
    borrowCount: 240,
    epubStorageKey: 'books/book-5/psychology_money.epub',
    createdAt: '2024-02-01',
    featured: false,
    chapters: [
      {
        id: 'chap-5-1',
        title: 'Bab 1: Tak Seorang Pun Gila',
        readTimeMinutes: 6,
        content: `<h3>Pengalaman Membentuk Sudut Pandang</h3>
<p>Pandangan Anda tentang uang dipengaruhi oleh masa kecil Anda, era di mana Anda tumbuh besar, dan kondisi ekonomi keluarga saat Anda pertama kali mencari nafkah.</p>
<p>Seseorang yang tumbuh saat inflasi 1970-an memandang risiko sangat berbeda dengan orang yang tumbuh saat booming saham teknologi tahun 1990-an. Tak seorang pun gila; mereka hanya bertindak sesuai pengalaman hidupnya.</p>`
      },
      {
        id: 'chap-5-2',
        title: 'Bab 2: Keberuntungan dan Risiko',
        readTimeMinutes: 7,
        content: `<h3>Dua Bersaudara yang Sering Dilupakan</h3>
<p>Keberuntungan dan risiko adalah sepupu dekat. Mereka adalah realitas bahwa setiap hasil dalam hidup dipandu oleh kekuatan lain selain usaha pribadi.</p>
<p>Saat menilai kesuksesan orang lain (atau kegagalan diri sendiri), jangan pernah meremehkan peran kedua faktor tak terduga ini.</p>`
      }
    ]
  },
  {
    id: 'book-6',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    isbn: '978-979-973-123-4',
    categoryId: 'cat-fiksi',
    categoryName: 'Fiksi & Sastra',
    description: 'Roman mahakarya tetralogi Buru. Kisah Minke, seorang pribumi cerdas di era kolonial Hindia Belanda, dan Nyai Ontosoroh, perempuan tangguh yang menolak tunduk pada ketidakadilan hukum kolonial.',
    coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    language: 'Bahasa Indonesia',
    publishedYear: 1980,
    pages: 535,
    totalCopies: 3,
    availableCopies: 1,
    rating: 4.9,
    ratingCount: 780,
    borrowCount: 340,
    epubStorageKey: 'books/book-6/bumi_manusia.epub',
    createdAt: '2024-01-20',
    featured: true,
    chapters: [
      {
        id: 'chap-6-1',
        title: 'Bab 1: Kenangan di H.B.S Surabaya',
        readTimeMinutes: 8,
        content: `<h3>Pribumi di Antara Bangsa Penakluk</h3>
<p>Namaku Minke. Bukan nama asli, melainkan ejekan seorang guru Belanda yang kemudian kupakai dengan bangga. Aku beruntung bisa duduk di bangku H.B.S, sekolah bergengsi yang dipenuhi totok dan Indo.</p>
<p>Duniaku berputar saat Robert Suurhof mengajakku berkunjung ke Wonokromo, ke rumah Nyai Ontosoroh. Di sanalah aku melihat Annelies Mellema untuk pertama kali—kecantikan yang menggetarkan akal budiku.</p>`
      }
    ]
  }
];

export const INITIAL_SOCIAL_ACTIVITIES: SocialActivity[] = [
  {
    id: 'act-1',
    userId: 'usr-2',
    userName: 'Dewi Lestari K.',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    userHandle: '@dewi_reads',
    actionType: 'finished_reading',
    bookId: 'book-1',
    bookTitle: 'Filosofi Teras: Panduan Stoikisme Menghadapi Kekhawatiran',
    bookAuthor: 'Henry Manampiring',
    bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    reviewComment: 'Membaca ulang bab Dikotomi Kendali selalu memberi ketenangan instan saat deadline kantor menyerbu. Buku wajib bagi siapa pun yang lelah overthinking.',
    timestamp: '2 jam yang lalu',
    likes: 19,
    likedBy: ['usr-1']
  },
  {
    id: 'act-2',
    userId: 'usr-3',
    userName: 'Farhan Ramadhan',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    userHandle: '@farhan_lit',
    actionType: 'started_reading',
    bookId: 'book-2',
    bookTitle: 'Laut Bercerita',
    bookAuthor: 'Leila S. Chudori',
    bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    timestamp: '4 jam yang lalu',
    likes: 12,
    likedBy: []
  },
  {
    id: 'act-3',
    userId: 'usr-admin',
    userName: 'Pustakawan Utama',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    userHandle: '@libraria_admin',
    actionType: 'admin_uploaded',
    bookId: 'book-6',
    bookTitle: 'Bumi Manusia (Edisi Kurasi Digital)',
    bookAuthor: 'Pramoedya Ananta Toer',
    bookCover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    details: 'Lisensi resmi perpustakaan diperbarui: 3 slot peminjaman telah dibuka untuk seluruh pembaca aktif.',
    timestamp: 'Kemarin',
    likes: 38,
    likedBy: ['usr-1', 'usr-2']
  },
  {
    id: 'act-4',
    userId: 'usr-4',
    userName: 'Rara Sekarwangi',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    userHandle: '@rara_sekar',
    actionType: 'created_shelf',
    shelfName: 'Amunisi Baca Akhir Pekan 2026',
    details: 'Menambahkan 4 buku filsafat dan sastra klasik ke dalam rak publik.',
    timestamp: '2 hari yang lalu',
    likes: 15,
    likedBy: []
  }
];

export const INITIAL_BOOK_REQUESTS: BookRequest[] = [
  {
    id: 'req-1',
    userId: 'usr-1',
    userName: 'Mukhamad Azis Tholib',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    title: 'Man\'s Search for Meaning',
    author: 'Viktor E. Frankl',
    reason: 'Karya psikologi eksistensial klasik tentang menemukan makna hidup di tengah penderitaan ekstrem kamp konsentrasi. Sangat dibutuhkan komunitas pembaca.',
    status: 'ditinjau',
    upvotes: 42,
    upvotedBy: ['usr-1', 'usr-2', 'usr-3', 'usr-4'],
    createdAt: '2024-03-01'
  },
  {
    id: 'req-2',
    userId: 'usr-3',
    userName: 'Farhan Ramadhan',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    title: 'Cantik Itu Luka',
    author: 'Eka Kurniawan',
    reason: 'Karya sastra realisme magis Indonesia yang telah diterjemahkan ke lebih dari 30 bahasa. Koleksi sastra kita perlu novel ini.',
    status: 'disetujui',
    upvotes: 68,
    upvotedBy: ['usr-2', 'usr-3'],
    createdAt: '2024-02-15',
    adminNote: 'Lisensi EPUB sedang diproses dari penerbit Gramedia. Perkiraan upload minggu depan.'
  },
  {
    id: 'req-3',
    userId: 'usr-5',
    userName: 'Nadia Saphira',
    userAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    title: 'Deep Work: Rules for Focused Success in a Distracted World',
    author: 'Cal Newport',
    reason: 'Panduan fokus mendalam di era media sosial dan notifikasi tanpa henti. Relevan untuk mahasiswa & pekerja lepas.',
    status: 'diajukan',
    upvotes: 27,
    upvotedBy: ['usr-1', 'usr-5'],
    createdAt: '2024-03-10'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    userId: 'usr-1',
    userName: 'Mukhamad Azis Tholib',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    userHandle: '@azis_reader',
    bookId: 'book-1',
    bookTitle: 'Filosofi Teras',
    rating: 5,
    comment: 'Buku ini menyelamatkan kesehatan mental saya tahun lalu. Gaya penulisan Om Henry yang santai dengan analogi keseharian bikin filsafat Yunani-Romawi kuno terasa relevan di tengah hiruk-pikuk Jakarta.',
    likes: 24,
    likedBy: ['usr-2', 'usr-3'],
    createdAt: '2024-02-14'
  },
  {
    id: 'rev-2',
    userId: 'usr-2',
    userName: 'Dewi Lestari K.',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    userHandle: '@dewi_reads',
    bookId: 'book-2',
    bookTitle: 'Laut Bercerita',
    rating: 5,
    comment: 'Bab pertama saja sudah membuat dada sesak. Mbak Leila merajut kepedihan keluarga korban penghilangan paksa 1998 dengan begitu anggun dan berani. Karya yang wajib dibaca generasi muda.',
    likes: 31,
    likedBy: ['usr-1'],
    createdAt: '2024-02-20'
  },
  {
    id: 'rev-3',
    userId: 'usr-3',
    userName: 'Farhan Ramadhan',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    userHandle: '@farhan_lit',
    bookId: 'book-3',
    bookTitle: 'Atomic Habits',
    rating: 4,
    comment: 'Sangat actionable! Rumus 2-minute rule benar-benar bekerja untuk membangun kebiasaan membaca tiap malam sebelum tidur.',
    likes: 14,
    likedBy: [],
    createdAt: '2024-01-28'
  }
];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  maxBorrowPerUser: 3,
  borrowDurationDays: 30,
  reminderDaysBeforeDue: 3,
  allowExtendLoan: true,
  maxExtendDays: 7,
};

export const INITIAL_CUSTOM_SHELVES: CustomShelf[] = [
  {
    id: 'shelf-1',
    userId: 'usr-1',
    name: 'Filsafat Stoik & Eksistensial',
    description: 'Buku-buku penenang badai pikiran dan penuntun kejernihan mental.',
    isPublic: true,
    bookIds: ['book-1', 'book-4'],
    createdAt: '2024-01-15'
  },
  {
    id: 'shelf-2',
    userId: 'usr-1',
    name: 'Sastra Indonesia Pilihan',
    description: 'Karya-karya sastra yang menggetarkan rasa kemanusiaan.',
    isPublic: true,
    bookIds: ['book-2', 'book-6'],
    createdAt: '2024-02-01'
  }
];
