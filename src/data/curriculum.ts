import type { LearningObjectiveId } from '../game/zakatLogic';

export type GameStageId =
  | 'title'
  | 'level1_princess'
  | 'level2_mystery'
  | 'world1_village'
  | 'world2_ricefield'
  | 'world3_caring'
  | 'final_boss'
  | 'final_tree';

export type WorldSceneId = 'world0' | 'world1' | 'world2' | 'world3' | 'final' | 'tree';

export interface StageMeta {
  id: GameStageId;
  scene: WorldSceneId;
  shortLabel: string;
  worldTitle: string;
  subtitle: string;
  tpTag: string;
}

export const STAGES_META: StageMeta[] = [
  {
    id: 'level1_princess',
    scene: 'world0',
    shortLabel: 'Level 1',
    worldTitle: 'World 0: Kingdom of Goodness',
    subtitle: 'Panggilan Princess & Pertanyaan Pemantik',
    tpTag: 'Orientasi Misi',
  },
  {
    id: 'level2_mystery',
    scene: 'world0',
    shortLabel: 'Level 2',
    worldTitle: 'World 0: Mystery Question Block',
    subtitle: 'Asesmen Awal Pengetahuan ZIS',
    tpTag: 'Asesmen Awal',
  },
  {
    id: 'world1_village',
    scene: 'world1',
    shortLabel: 'World 1',
    worldTitle: 'World 1: Village of Kindness',
    subtitle: 'Ketentuan ZIS & 8 Golongan Asnaf',
    tpTag: 'TP 1',
  },
  {
    id: 'world2_ricefield',
    scene: 'world2',
    shortLabel: 'World 2',
    worldTitle: 'World 2: Magic Rice Field',
    subtitle: 'Kalkulator, Tantangan Beras & Waktu Zakat Fitrah',
    tpTag: 'TP 2',
  },
  {
    id: 'world3_caring',
    scene: 'world3',
    shortLabel: 'World 3',
    worldTitle: 'World 3: Kingdom of Caring',
    subtitle: 'Simulasi Distribusi Dana Sosial & Laporan',
    tpTag: 'TP 3',
  },
  {
    id: 'final_boss',
    scene: 'final',
    shortLabel: 'Final Boss',
    worldTitle: 'Final World: Dark Castle',
    subtitle: 'Tantangan Naga & 15 Soal Evaluasi',
    tpTag: 'Evaluasi TP 1-3',
  },
  {
    id: 'final_tree',
    scene: 'tree',
    shortLabel: 'Level Akhir',
    worldTitle: 'Sanctuary: Tree of Kindness',
    subtitle: 'Refleksi Bermakna & Komitmen Kebaikan',
    tpTag: 'Refleksi Akhir',
  },
];

export const PRINCESS_CALL_SPEECH =
  'Kerajaan Kebaikan sedang menghadapi masalah. Banyak penduduk membutuhkan bantuan. Kerajaan membutuhkan seorang Zakat Hero yang memahami zakat, infaq, dan sedekah. Maukah kamu membantu?';

export interface SparkQuestion {
  id: string;
  question: string;
  starterAnswer: string;
  toadHint: string;
}

export const SPARK_QUESTIONS: SparkQuestion[] = [
  {
    id: 'spark-1',
    question: 'Mengapa kita harus berbagi dengan sesama?',
    starterAnswer: 'Karena berbagi meringankan beban orang lain, menumbuhkan kasih sayang, dan membersihkan hati serta harta kita.',
    toadHint: 'Setiap harta yang kita titipi sebagian rezekinya milik saudara kita yang membutuhkan.',
  },
  {
    id: 'spark-2',
    question: 'Pernahkah kamu melihat orang yang membutuhkan bantuan di sekitarmu?',
    starterAnswer: 'Pernah, misalnya tetangga yang sakit, teman yang kekurangan perlengkapan sekolah, atau pekerja yang kesulitan makan.',
    toadHint: 'Kepekaan melihat kesulitan orang di sekitar adalah langkah awal menjadi Zakat Hero!',
  },
  {
    id: 'spark-3',
    question: 'Apa perbedaan utama antara zakat dan sedekah?',
    starterAnswer: 'Zakat hukumnya wajib dengan aturan jumlah dan penerimanya, sedangkan sedekah hukumnya sunah dan bentuknya sangat luas.',
    toadHint: 'Bagus! Nanti kita akan pelajari lebih dalam bersama Toad Guide di Village of Kindness.',
  },
  {
    id: 'spark-4',
    question: 'Bagaimana ajaran Islam membimbing kita membantu sesama?',
    starterAnswer: 'Islam mengajarkan tolong-menolong dalam kebaikan melalui kewajiban zakat serta anjuran infaq dan sedekah dengan ikhlas.',
    toadHint: 'Tepat sekali! Islam menata kepedulian sosial agar masyarakat hidup adil dan sejahtera.',
  },
];

export interface DiagnosticQuestion {
  id: string;
  prompt: string;
  options: [string, string, string];
  correctIndex: number;
  feedback: string;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag-1',
    prompt: 'Rafi menyisihkan sebagian uang jajannya untuk dimasukkan ke kotak amal masjid setiap hari Jumat. Perbuatan Rafi termasuk contoh...',
    options: ['Zakat Fitrah', 'Infaq', 'Riba'],
    correctIndex: 1,
    feedback: 'Memasukkan uang ke kotak amal masjid untuk kebaikan merupakan contoh Infaq karena berupa harta yang dikeluarkan secara sukarela di jalan kebaikan.',
  },
  {
    id: 'diag-2',
    prompt: 'Manakah di antara berikut ini yang hukumnya WAJIB bagi setiap muslim yang memenuhi syarat?',
    options: ['Zakat', 'Sedekah senyum', 'Hadiah ulang tahun'],
    correctIndex: 0,
    feedback: 'Zakat merupakan rukun Islam ketiga yang hukumnya wajib apabila telah memenuhi syarat ketentuan syariat.',
  },
  {
    id: 'diag-3',
    prompt: 'Salma tersenyum ramah dan membantu temannya yang kesulitan membawa buku. Dalam Islam, kebaikan nonmateri tersebut tergolong...',
    options: ['Zakat Mal', 'Sedekah', 'Pajak'],
    correctIndex: 1,
    feedback: 'Sedekah sangat luas maknanya—tidak hanya harta, tetapi juga perbuatan baik, tenaga, ilmu, bahkan senyuman tulus.',
  },
  {
    id: 'diag-4',
    prompt: 'Golongan orang yang berhak menerima zakat dalam Al-Qur\'an berjumlah...',
    options: ['4 golongan', '8 golongan (Asnaf)', '12 golongan'],
    correctIndex: 1,
    feedback: 'Ada 8 golongan penerima zakat (mustahik/asnaf) yang dijelaskan dalam Surah At-Taubah ayat 60.',
  },
  {
    id: 'diag-5',
    prompt: 'Di Indonesia, besaran zakat fitrah dalam bentuk beras umumnya ditunaikan sebanyak...',
    options: ['1 kg per orang', '2,5 kg per orang', '10 kg per orang'],
    correctIndex: 1,
    feedback: 'Besaran zakat fitrah adalah 1 sha\' makanan pokok, yang di Indonesia didekatkan menjadi 2,5 kg atau sekitar 3,5 liter beras per jiwa.',
  },
];

export interface ZisComparisonRow {
  aspek: string;
  zakat: string;
  infaq: string;
  sedekah: string;
}

export const ZIS_DEFINITIONS = [
  {
    type: 'zakat' as const,
    title: 'A. ZAKAT',
    color: '#D97706',
    bg: '#FEF3C7',
    summary:
      'Zakat adalah kewajiban mengeluarkan sebagian harta tertentu dengan ketentuan tertentu untuk diberikan kepada golongan yang berhak menerimanya.',
  },
  {
    type: 'infaq' as const,
    title: 'B. INFAQ',
    color: '#0284C7',
    bg: '#E0F2FE',
    summary:
      'Infaq adalah mengeluarkan sebagian harta untuk kepentingan yang baik sesuai tuntunan Islam.',
  },
  {
    type: 'sedekah' as const,
    title: 'C. SEDEKAH',
    color: '#059669',
    bg: '#D1FAE5',
    summary:
      'Sedekah adalah pemberian atau perbuatan baik untuk membantu sesama. Sedekah dapat berupa materi maupun nonmateri.',
  },
];

export const ZIS_COMPARISON_MATRIX: ZisComparisonRow[] = [
  {
    aspek: 'Hukum',
    zakat: 'Wajib (Fardu \'Ain) bagi yang memenuhi syarat.',
    infaq: 'Sunah (bisa menjadi wajib dalam kondisi tertentu, seperti menafkahi keluarga).',
    sedekah: 'Sunah dan sangat dianjurkan setiap waktu.',
  },
  {
    aspek: 'Ketentuan',
    zakat: 'Memiliki aturan kadar, nisab/ukuran (seperti 2,5 kg beras zakat fitrah), dan waktu khusus.',
    infaq: 'Tidak dibatasi jumlah minimal maupun waktu tertentu.',
    sedekah: 'Tidak dibatasi jumlah, waktu, maupun bentuknya.',
  },
  {
    aspek: 'Bentuk Pemberian',
    zakat: 'Berupa harta atau makanan pokok sesuai ketentuan syariat.',
    infaq: 'Berupa harta benda atau uang untuk kebaikan.',
    sedekah: 'Bisa materi (makanan, uang) atau nonmateri (senyum, tenaga, ilmu, doa).',
  },
  {
    aspek: 'Penerima atau Manfaat',
    zakat: 'Khusus untuk 8 golongan (asnaf) mustahik zakat.',
    infaq: 'Bisa diberikan kepada keluarga, fasilitas umum, masjid, sekolah, atau sesama.',
    sedekah: 'Sangat luas: siapa saja yang membutuhkan dan membawa manfaat kebaikan.',
  },
];

export type ZisCategory = 'zakat' | 'infaq' | 'sedekah';

export interface ZisSortItem {
  id: string;
  text: string;
  category: ZisCategory;
  reason: string;
}

export const ZIS_SORT_ITEMS: ZisSortItem[] = [
  {
    id: 'sort-1',
    text: 'Menunaikan 2,5 kg beras per jiwa sebelum salat Idulfitri.',
    category: 'zakat',
    reason: 'Zakat fitrah memiliki kadar khusus (1 sha\' / 2,5 kg beras) dan wajib ditunaikan.',
  },
  {
    id: 'sort-2',
    text: 'Membayar zakat hasil panen pertanian saat sudah mencapai nisab.',
    category: 'zakat',
    reason: 'Zakat pertanian adalah kewajiban harta yang memiliki batas nisab dan penerima khusus.',
  },
  {
    id: 'sort-3',
    text: 'Menyumbang Rp50.000 untuk pembangunan perpustakaan masjid desa.',
    category: 'infaq',
    reason: 'Mengeluarkan uang/harta untuk kepentingan umum dan dakwah termasuk Infaq.',
  },
  {
    id: 'sort-4',
    text: 'Mengisi kotak infaq kelas setiap Jumat untuk membantu kegiatan sosial.',
    category: 'infaq',
    reason: 'Pengeluaran harta sukarela tanpa kadar wajib untuk kebaikan adalah Infaq.',
  },
  {
    id: 'sort-5',
    text: 'Menyingkirkan duri atau batu dari jalan agar pejalan kaki aman.',
    category: 'sedekah',
    reason: 'Perbuatan baik nonmateri yang menolong orang lain bernilai Sedekah.',
  },
  {
    id: 'sort-6',
    text: 'Tersenyum ramah dan membantu teman belajar materi Fikih.',
    category: 'sedekah',
    reason: 'Sedekah mencakup senyuman tulus, ilmu, dan tenaga tanpa harus berupa uang.',
  },
  {
    id: 'sort-7',
    text: 'Menyalurkan zakat mal melalui lembaga amil zakat kepada fakir miskin.',
    category: 'zakat',
    reason: 'Zakat harta yang wajib ditunaikan dan disalurkan kepada 8 asnaf.',
  },
  {
    id: 'sort-8',
    text: 'Menyumbang biaya operasional ambulans gratis desa dari tabungan pribadi.',
    category: 'infaq',
    reason: 'Membelanjakan harta untuk fasilitas kemaslahatan umat merupakan Infaq.',
  },
  {
    id: 'sort-9',
    text: 'Berbagi roti bekal kepada teman sebangku yang lupa membawa makanan.',
    category: 'sedekah',
    reason: 'Pemberian sukarela langsung untuk membantu teman merupakan Sedekah.',
  },
];

export interface AsnafInfo {
  id: string;
  name: string;
  shortDesc: string;
  detail: string;
  villagerStory: string;
  badgeColor: string;
}

export const EIGHT_ASNAF: AsnafInfo[] = [
  {
    id: 'fakir',
    name: '1. Fakir',
    shortDesc: 'Orang yang tidak memiliki harta dan penghasilan untuk memenuhi kebutuhan dasar hidupnya.',
    detail: 'Fakir adalah orang yang kondisinya paling berat karena hampir tidak memiliki harta atau tenaga untuk mencukupi kebutuhan pokok sehari-hari.',
    villagerStory: 'Kakek Hasan sudah lanjut usia, tidak memiliki keluarga dan tidak mampu bekerja lagi.',
    badgeColor: '#DC2626',
  },
  {
    id: 'miskin',
    name: '2. Miskin',
    shortDesc: 'Orang yang memiliki pekerjaan atau penghasilan, tetapi belum mencukupi kebutuhan hidup.',
    detail: 'Miskin tetap berusaha bekerja, namun hasilnya tidak cukup untuk makan, tempat tinggal, dan biaya sekolah anak-anaknya.',
    villagerStory: 'Pak Budi bekerja serabutan setiap hari, namun upahnya masih kurang untuk makan keluarganya.',
    badgeColor: '#EA580C',
  },
  {
    id: 'amil',
    name: '3. Amil',
    shortDesc: 'Orang atau panitia resmi yang bertugas mengumpulkan, mencatat, dan menyalurkan zakat.',
    detail: 'Amil memastikan pengumpulan dan pembagian zakat berjalan tertib, amanah, dan tepat sasaran sesuai syariat.',
    villagerStory: 'Kak Nadia bertugas di pos resmi zakat desa untuk mencatat dan mengantar beras ke warga.',
    badgeColor: '#D97706',
  },
  {
    id: 'mualaf',
    name: '4. Mualaf',
    shortDesc: 'Orang yang baru memeluk agama Islam dan perlu dikuatkan imannya.',
    detail: 'Zakat membantu menumbuhkan rasa persaudaraan dan keteguhan hati bagi saudara kita yang baru masuk Islam.',
    villagerStory: 'Saudara Tariq baru saja memeluk Islam dan membutuhkan dukungan komunitas desa.',
    badgeColor: '#059669',
  },
  {
    id: 'riqab',
    name: '5. Riqab',
    shortDesc: 'Hamba sahaya atau orang yang sedang berupaya memerdekakan diri dari perbudakan.',
    detail: 'Islam sangat memuliakan kebebasan manusia dan mengalokasikan zakat untuk membebaskan hamba sahaya pada masanya.',
    villagerStory: 'Membantu membebaskan pekerja yang terbelenggu perbudakan agar hidup merdeka.',
    badgeColor: '#0D9488',
  },
  {
    id: 'gharim',
    name: '6. Gharim',
    shortDesc: 'Orang yang terlilit utang demi memenuhi kebutuhan halal dan mendesak, serta kesulitan membayarnya.',
    detail: 'Utang yang dimaksud adalah utang untuk kebutuhan hidup pokok atau kebaikan, bukan untuk foya-foya atau maksiat.',
    villagerStory: 'Ibu Siti terpaksa berutang untuk biaya berobat mendesak anaknya dan tidak sanggup melunasinya.',
    badgeColor: '#0284C7',
  },
  {
    id: 'fisabilillah',
    name: '7. Fisabilillah',
    shortDesc: 'Orang yang berjuang di jalan Allah untuk menegakkan kebaikan dan syiar Islam.',
    detail: 'Termasuk pejuang kebaikan, pendakwah, atau pembela kebenaran di jalan Allah tanpa pamrih.',
    villagerStory: 'Ustaz Farhan mengajar mengaji gratis di daerah terpencil demi menyebarkan ilmu Islam.',
    badgeColor: '#4F46E5',
  },
  {
    id: 'ibnu-sabil',
    name: '8. Ibnu Sabil',
    shortDesc: 'Musafir yang kehabisan bekal dalam perjalanan yang baik dan bukan untuk maksiat.',
    detail: 'Walaupun di kampung halamannya mampu, saat perjalanan jauh dan kehabisan ongkos/bekal, ia berhak dibantu.',
    villagerStory: 'Pelajar perantau yang kehabisan ongkos pulang ke kampung halaman setelah menuntut ilmu.',
    badgeColor: '#7C3AED',
  },
];

export interface ZakatTimeStage {
  id: 'awal-ramadan' | 'menjelang-idulfitri' | 'sebelum-salat-id' | 'setelah-salat-id';
  label: string;
  statusTitle: string;
  explanation: string;
  badgeTone: 'allowed' | 'best' | 'late';
}

export const ZAKAT_TIME_STAGES: ZakatTimeStage[] = [
  {
    id: 'awal-ramadan',
    label: 'Awal Ramadan',
    statusTitle: 'Waktu Diperbolehkan (Ta\'jil)',
    explanation: 'Zakat fitrah sudah boleh ditunaikan sejak hari pertama bulan Ramadan.',
    badgeTone: 'allowed',
  },
  {
    id: 'menjelang-idulfitri',
    label: 'Menjelang Idulfitri (Malam Takbiran)',
    statusTitle: 'Waktu Wajib Dimulai',
    explanation: 'Waktu wajib bermula saat matahari terbenam di akhir Ramadan hingga malam takbiran.',
    badgeTone: 'allowed',
  },
  {
    id: 'sebelum-salat-id',
    label: 'Sebelum Salat Idulfitri',
    statusTitle: 'Waktu Paling Utama (Afzal)',
    explanation: 'Waktu paling utama menunaikan zakat fitrah adalah setelah salat Subuh sebelum salat Idulfitri dilaksanakan.',
    badgeTone: 'best',
  },
  {
    id: 'setelah-salat-id',
    label: 'Setelah Salat Idulfitri',
    statusTitle: 'Bukan Zakat Fitrah (Sedekah Biasa)',
    explanation: 'Jika dibayarkan setelah salat Idulfitri selesai tanpa uzur, nilainya menjadi sedekah biasa.',
    badgeTone: 'late',
  },
];

export interface CharityNeedItem {
  id: 'pokok' | 'pendidikan' | 'kesehatan' | 'darurat';
  title: string;
  houseName: string;
  story: string;
  suggestedRange: string;
}

export const CHARITY_NEEDS: CharityNeedItem[] = [
  {
    id: 'pokok',
    title: '1. Bantuan Kebutuhan Pokok Keluarga Miskin',
    houseName: 'Rumah Keluarga Pak Budi',
    story: 'Keluarga dengan 4 anak ini membutuhkan beras, minyak, dan lauk bergizi untuk 1 bulan ke depan.',
    suggestedRange: 'Contoh: Rp300.000 - Rp400.000',
  },
  {
    id: 'pendidikan',
    title: '2. Bantuan Pendidikan',
    houseName: 'Rumah Adik Aisyah',
    story: 'Aisyah membutuhkan tas, buku pelajaran, dan seragam sekolah agar dapat belajar dengan semangat.',
    suggestedRange: 'Contoh: Rp200.000 - Rp300.000',
  },
  {
    id: 'kesehatan',
    title: '3. Bantuan Kesehatan',
    houseName: 'Rumah Nenek Aminah',
    story: 'Nenek Aminah membutuhkan obat-obatan dan pemeriksaan rutin di puskesmas.',
    suggestedRange: 'Contoh: Rp150.000 - Rp250.000',
  },
  {
    id: 'darurat',
    title: '4. Bantuan Kebutuhan Darurat',
    houseName: 'Rumah Korban Banjir & Atap Bocor',
    story: 'Atap rumah keluarga ini rusak akibat hujan deras dan perlu segera diperbaiki sebelum malam.',
    suggestedRange: 'Contoh: Rp150.000 - Rp250.000',
  },
];

export const REFLECTIVE_QUESTIONS_WORLD3 = [
  'Mengapa kita harus membantu orang yang membutuhkan di sekitar kita?',
  'Bagaimana sedekah dan bantuan sosial membantu mengurangi kesulitan hidup warga?',
  'Apa akibatnya jika pembagian dana sosial dilakukan secara tidak adil atau pilih kasih?',
  'Bagaimana cara kita mengelola dana sosial kelas agar jujur, transparan, dan amanah?',
];

export interface BossQuizQuestion {
  id: string;
  number: number;
  tp: LearningObjectiveId;
  difficulty: 'Mudah' | 'Menengah' | 'Tantangan';
  prompt: string;
  options: [string, string, string];
  correctIndex: number;
  explanation: string;
}

export const BOSS_QUIZ_QUESTIONS: BossQuizQuestion[] = [
  // TP 1 (5 Soal: Perbedaan ZIS & Mustahik)
  {
    id: 'boss-1',
    number: 1,
    tp: 'TP1',
    difficulty: 'Mudah',
    prompt: 'Pernyataan berikut yang paling tepat membedakan zakat dengan infaq dan sedekah adalah...',
    options: [
      'Zakat hukumnya wajib dengan aturan kadar dan 8 penerima khusus, sedangkan infaq/sedekah hukumnya sunah tanpa batas minimal.',
      'Zakat hanya boleh berupa senyuman, sedangkan sedekah wajib berupa beras 2,5 kg.',
      'Zakat diberikan kepada siapa saja tanpa aturan, sedangkan sedekah hanya untuk amil.',
    ],
    correctIndex: 0,
    explanation: 'Zakat adalah kewajiban syariat dengan syarat, ukuran, dan 8 asnaf penerima tertentu, sedangkan infaq dan sedekah bersifat sunah dan luas.',
  },
  {
    id: 'boss-2',
    number: 2,
    tp: 'TP1',
    difficulty: 'Mudah',
    prompt: 'Ketika Dinda membantu membersihkan papan tulis kelas dengan tulus agar guru dan teman nyaman belajar, perbuatan Dinda termasuk...',
    options: ['Zakat Fitrah', 'Sedekah nonmateri', 'Gharim'],
    correctIndex: 1,
    explanation: 'Membantu orang lain dengan tenaga dan ketulusan termasuk sedekah nonmateri yang berpahala kebaikan.',
  },
  {
    id: 'boss-3',
    number: 3,
    tp: 'TP1',
    difficulty: 'Menengah',
    prompt: 'Pak Karim memiliki usaha kecil, tetapi penghasilannya setiap hari tidak mencukupi kebutuhan makan dan sekolah ketiga anaknya. Dalam 8 asnaf, Pak Karim termasuk golongan...',
    options: ['Miskin', 'Amil', 'Ibnu Sabil'],
    correctIndex: 0,
    explanation: 'Golongan Miskin adalah orang yang memiliki usaha atau penghasilan, tetapi tidak cukup untuk memenuhi kebutuhan dasar hidupnya.',
  },
  {
    id: 'boss-4',
    number: 4,
    tp: 'TP1',
    difficulty: 'Menengah',
    prompt: 'Seorang mahasiswa yang sedang menempuh perjalanan menuntut ilmu jauh dari kampungnya kehabisan ongkos pulang dan bekal makanan. Ia berhak menerima zakat sebagai...',
    options: ['Mualaf', 'Ibnu Sabil', 'Riqab'],
    correctIndex: 1,
    explanation: 'Ibnu Sabil adalah musafir dalam perjalanan yang baik dan kehabisan bekal sehingga layak dibantu zakat.',
  },
  {
    id: 'boss-5',
    number: 5,
    tp: 'TP1',
    difficulty: 'Tantangan',
    prompt: 'Ibu Rahma terpaksa meminjam uang untuk membiayai operasi darurat anaknya di rumah sakit dan kini tidak mampu melunasi utang tersebut. Golongan asnaf manakah yang tepat untuk Ibu Rahma?',
    options: ['Gharim', 'Fisabilillah', 'Amil'],
    correctIndex: 0,
    explanation: 'Gharim adalah orang yang menanggung utang untuk kebutuhan halal dan mendesak (seperti berobat/kebutuhan pokok) dan tidak sanggup membayarnya.',
  },

  // TP 2 (5 Soal: Perhitungan & Waktu Zakat Fitrah)
  {
    id: 'boss-6',
    number: 6,
    tp: 'TP2',
    difficulty: 'Mudah',
    prompt: 'Ukuran zakat fitrah dalam bentuk makanan pokok (beras) menurut pendekatan yang berlaku di Indonesia adalah...',
    options: ['1,5 kg per jiwa', '2,5 kg (sekitar 3,5 liter) per jiwa', '5 kg per jiwa'],
    correctIndex: 1,
    explanation: '1 sha\' makanan pokok di Indonesia didekatkan menjadi 2,5 kg atau sekitar 3,5 liter beras per jiwa.',
  },
  {
    id: 'boss-7',
    number: 7,
    tp: 'TP2',
    difficulty: 'Menengah',
    prompt: 'Keluarga Pak Ridwan terdiri dari ayah, ibu, 3 anak, dan 1 nenek yang tinggal bersama dan menjadi tanggungannya. Berapa kg beras zakat fitrah yang wajib ditunaikan?',
    options: ['12,5 kg beras', '15 kg beras', '17,5 kg beras'],
    correctIndex: 1,
    explanation: 'Total jiwa = 1 + 1 + 3 + 1 = 6 jiwa. 6 × 2,5 kg = 15 kg beras.',
  },
  {
    id: 'boss-8',
    number: 8,
    tp: 'TP2',
    difficulty: 'Menengah',
    prompt: 'Jika simulasi ketetapan nominal uang zakat fitrah daerah setempat adalah Rp45.000 per jiwa, berapa uang yang harus disiapkan untuk 4 anggota keluarga?',
    options: ['Rp135.000', 'Rp180.000', 'Rp225.000'],
    correctIndex: 1,
    explanation: '4 anggota keluarga × Rp45.000 = Rp180.000. Nominal uang selalu mengikuti ketetapan resmi lembaga zakat setempat.',
  },
  {
    id: 'boss-9',
    number: 9,
    tp: 'TP2',
    difficulty: 'Tantangan',
    prompt: 'Kapankah waktu PALING UTAMA (afzal) untuk menunaikan zakat fitrah?',
    options: [
      'Pada hari pertama bulan Ramadan sebelum sahur',
      'Setelah salat Subuh di hari Idulfitri sebelum salat Idulfitri dimulai',
      'Sore hari setelah seluruh acara halalbihalal Idulfitri selesai',
    ],
    correctIndex: 1,
    explanation: 'Waktu paling utama (afzal) membayar zakat fitrah adalah sesudah salat Subuh hingga sebelum dimulainya salat Idulfitri.',
  },
  {
    id: 'boss-10',
    number: 10,
    tp: 'TP2',
    difficulty: 'Tantangan',
    prompt: 'Pak Arman lupa membayar zakat fitrah hingga salat Idulfitri selesai dilaksanakan dan baru menyerahkannya siang hari tanpa alasan syar\'i. Bagaimana status pemberian Pak Arman?',
    options: [
      'Tetap dihitung zakat fitrah paling utama',
      'Menjadi sedekah biasa, bukan zakat fitrah tepat waktu',
      'Menjadi zakat hasil pertanian',
    ],
    correctIndex: 1,
    explanation: 'Zakat fitrah yang dibayarkan setelah salat Idulfitri selesai bernilai sedekah biasa karena melewati batas waktu pelaksanaan zakat fitrah.',
  },

  // TP 3 (5 Soal: Dampak Sosial & Distribusi Amanah ZIS)
  {
    id: 'boss-11',
    number: 11,
    tp: 'TP3',
    difficulty: 'Mudah',
    prompt: 'Salah satu tujuan utama distribusi Zakat, Infaq, dan Sedekah (ZIS) dalam masyarakat adalah...',
    options: [
      'Menumpuk harta di satu kelompok kaya saja',
      'Membantu mengentaskan kemiskinan dan meringankan beban warga prasejahtera',
      'Membuat penerima zakat menjadi malas bekerja',
    ],
    correctIndex: 1,
    explanation: 'ZIS bertujuan menumbuhkan keadilan sosial, mengentaskan kemiskinan, dan membantu warga yang membutuhkan agar dapat hidup layak.',
  },
  {
    id: 'boss-12',
    number: 12,
    tp: 'TP3',
    difficulty: 'Menengah',
    prompt: 'Kelas 6 mengumpulkan dana sosial Rp1.000.000. Di desa ada warga kekurangan pangan, siswa butuh buku, lansia sakit, dan rumah bocor. Langkah distribusi paling amanah adalah...',
    options: [
      'Memberikan seluruh dana Rp1.000.000 hanya untuk teman akrab ketua kelas',
      'Membagi dana secara adil dan proporsional ke keempat pos kebutuhan mendesak serta mencatat laporannya secara transparan',
      'Menyimpan seluruh dana di lemari sampai tahun depan tanpa disalurkan',
    ],
    correctIndex: 1,
    explanation: 'Sikap amanah dan keadilan menuntut pengelola menyalurkan dana sesuai prioritas kebutuhan nyata dan menyusun laporan secara transparan.',
  },
  {
    id: 'boss-13',
    number: 13,
    tp: 'TP3',
    difficulty: 'Menengah',
    prompt: 'Mengapa siswa tidak boleh menetapkan mustahik zakat secara sembarangan saat menyalurkan zakat sesungguhnya?',
    options: [
      'Karena penyaluran zakat sudah ditetapkan syariat Islam khusus bagi 8 golongan (asnaf) agar tepat sasaran',
      'Karena zakat hanya boleh diberikan kepada teman satu sekolah',
      'Karena zakat tidak memiliki aturan penerima',
    ],
    correctIndex: 0,
    explanation: 'Simulasi dana sosial kelas melatih kepedulian, sedangkan penyaluran zakat sesungguhnya wajib mengikuti ketentuan syariat (8 asnaf).',
  },
  {
    id: 'boss-14',
    number: 14,
    tp: 'TP3',
    difficulty: 'Tantangan',
    prompt: 'Jika dana bantuan pendidikan Rp300.000 diberikan tepat sasaran kepada anak dari keluarga miskin, dampak sosial jangka panjang yang paling diharapkan adalah...',
    options: [
      'Anak tersebut dapat terus bersekolah dan memiliki peluang masa depan yang lebih baik untuk keluar dari kemiskinan',
      'Anak tersebut berhenti bersekolah selamanya',
      'Dana habis tanpa manfaat bagi masyarakat',
    ],
    correctIndex: 0,
    explanation: 'Bantuan pendidikan memutus rantai kemiskinan sehingga anak tetap belajar, meraih cita-cita, dan kelak bisa ikut membantu sesama.',
  },
  {
    id: 'boss-15',
    number: 15,
    tp: 'TP3',
    difficulty: 'Tantangan',
    prompt: 'Apa akibat yang timbul apabila pengelola dana sosial bersikap tidak amanah atau membagikan bantuan secara tidak adil?',
    options: [
      'Masyarakat menjadi semakin percaya dan rukun',
      'Warga yang benar-benar membutuhkan tidak terbantu, muncul kecemburuan sosial, dan hilangnya kepercayaan masyarakat',
      'Jumlah dana sosial otomatis berlipat ganda',
    ],
    correctIndex: 1,
    explanation: 'Ketidakadilan dan hilangnya amanah merugikan kaum duafa, memicu kecemburuan, serta merusak kepercayaan warga terhadap lembaga sosial.',
  },
];

export const FINAL_REFLECTION_CHECKBOXES = [
  'Saya memahami perbedaan zakat, infaq, dan sedekah.',
  'Saya dapat menghitung zakat fitrah.',
  'Saya memahami pentingnya berbagi.',
  'Saya ingin lebih peduli kepada orang lain.',
  'Saya akan membiasakan diri bersedekah.',
];

export const FINAL_INSPIRATIONAL_MESSAGE =
  'Zakat bukan sekadar mengeluarkan harta. Zakat adalah cara kita membersihkan harta, menumbuhkan kepedulian, dan membantu sesama. Jadilah Zakat Hero dalam kehidupan sehari-hari!';

export interface BadgeInfo {
  id: 'zis_explorer' | 'zakat_calculator' | 'charity_hero' | 'zakat_master';
  title: string;
  description: string;
  world: string;
  color: string;
}

export const GAME_BADGES: BadgeInfo[] = [
  {
    id: 'zis_explorer',
    title: 'ZIS Explorer',
    description: 'Menyelesaikan materi ZIS dan menyelamatkan 8 penduduk Asnaf di Village of Kindness.',
    world: 'World 1',
    color: '#059669',
  },
  {
    id: 'zakat_calculator',
    title: 'Zakat Calculator',
    description: 'Menghitung zakat fitrah, mengumpulkan beras, dan menguasai waktu zakat fitrah di Magic Rice Field.',
    world: 'World 2',
    color: '#D97706',
  },
  {
    id: 'charity_hero',
    title: 'Charity Hero',
    description: 'Menyelesaikan simulasi distribusi dana sosial Rp1.000.000 dengan adil dan amanah.',
    world: 'World 3',
    color: '#0284C7',
  },
  {
    id: 'zakat_master',
    title: 'Zakat Master',
    description: 'Mengalahkan Naga Penjaga Gerbang di Dark Castle dan menuntaskan 15 soal evaluasi.',
    world: 'Final World',
    color: '#7C3AED',
  },
];
