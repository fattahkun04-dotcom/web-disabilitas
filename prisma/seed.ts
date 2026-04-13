import { PrismaClient, Role, MemberStatus, EventStatus, TransactionType, TransactionCategory } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.forumReaction.deleteMany();
  await prisma.forumComment.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.forumCategory.deleteMany();
  await prisma.eventDocument.deleteMany();
  await prisma.eventRsvp.deleteMany();
  await prisma.event.deleteMany();
  await prisma.budgetTransaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.organizationProfile.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();

  // ─── CREATE USERS ──────────────────────────────────────────
  console.log("👤 Creating users...");
  const passwordHash = await hashPassword("admin123");
  const memberPassword = await hashPassword("member123");

  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@sahabatabk.org",
      emailVerified: new Date(),
      passwordHash,
      name: "Admin Super",
      role: Role.SUPER_ADMIN,
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      email: "admin1@sahabatabk.org",
      emailVerified: new Date(),
      passwordHash,
      name: "Siti Rahayu",
      role: Role.ADMIN,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: "admin2@sahabatabk.org",
      emailVerified: new Date(),
      passwordHash,
      name: "Budi Santoso",
      role: Role.ADMIN,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: "dewi.angraini@email.com",
      emailVerified: new Date(),
      passwordHash: memberPassword,
      name: "Dewi Anggraini",
      role: Role.MEMBER,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: "ahmad.hidayat@email.com",
      emailVerified: new Date(),
      passwordHash: memberPassword,
      name: "Ahmad Hidayat",
      role: Role.MEMBER,
    },
  });

  const member3 = await prisma.user.create({
    data: {
      email: "ratna.sari@email.com",
      emailVerified: new Date(),
      passwordHash: memberPassword,
      name: "Ratna Sari",
      role: Role.MEMBER,
    },
  });

  const member4 = await prisma.user.create({
    data: {
      email: "eko.prasetyo@email.com",
      emailVerified: null,
      passwordHash: memberPassword,
      name: "Eko Prasetyo",
      role: Role.MEMBER,
    },
  });

  const member5 = await prisma.user.create({
    data: {
      email: "maya.putri@email.com",
      emailVerified: new Date(),
      passwordHash: memberPassword,
      name: "Maya Putri",
      role: Role.MEMBER,
    },
  });

  // ─── CREATE MEMBERS ──────────────────────────────────────────
  console.log("📋 Creating members...");
  const now = new Date();
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  await prisma.member.create({
    data: {
      userId: member1.id,
      phone: "081234567890",
      address: "Jl. Mawar No. 10, Jakarta Selatan",
      city: "Jakarta",
      province: "DKI Jakarta",
      joinedAt: twoMonthsAgo,
      status: MemberStatus.ACTIVE,
      childName: "Raka",
      childBirthYear: 2018,
      specialNeedType: "Autisme",
      verifiedAt: twoMonthsAgo,
      verifiedBy: admin1.id,
    },
  });

  await prisma.member.create({
    data: {
      userId: member2.id,
      phone: "082345678901",
      address: "Jl. Melati No. 5, Depok",
      city: "Depok",
      province: "Jawa Barat",
      joinedAt: oneMonthAgo,
      status: MemberStatus.ACTIVE,
      childName: "Aisyah",
      childBirthYear: 2019,
      specialNeedType: "ADHD",
      verifiedAt: oneMonthAgo,
      verifiedBy: admin2.id,
    },
  });

  await prisma.member.create({
    data: {
      userId: member3.id,
      phone: "083456789012",
      address: "Jl. Anggrek No. 20, Tangerang",
      city: "Tangerang",
      province: "Banten",
      joinedAt: twoWeeksAgo,
      status: MemberStatus.ACTIVE,
      childName: "Farel",
      childBirthYear: 2020,
      specialNeedType: "Down Syndrome",
      verifiedAt: twoWeeksAgo,
      verifiedBy: admin1.id,
    },
  });

  await prisma.member.create({
    data: {
      userId: member4.id,
      phone: "084567890123",
      address: "Jl. Dahlia No. 8, Bekasi",
      city: "Bekasi",
      province: "Jawa Barat",
      joinedAt: new Date(),
      status: MemberStatus.PENDING,
      childName: "Nayla",
      childBirthYear: 2021,
      specialNeedType: "Speech Delay",
    },
  });

  await prisma.member.create({
    data: {
      userId: member5.id,
      phone: "085678901234",
      address: "Jl. Kenanga No. 15, Bogor",
      city: "Bogor",
      province: "Jawa Barat",
      joinedAt: new Date(),
      status: MemberStatus.PENDING,
      childName: "Zidan",
      childBirthYear: 2017,
      specialNeedType: "Autisme",
    },
  });

  // ─── ORGANIZATION PROFILE ──────────────────────────────────
  console.log("🏛️  Creating organization profile...");
  await prisma.organizationProfile.create({
    data: {
      name: "Paguyuban Sahabat ABK",
      tagline: "Bersama Mendampingi, Tumbuh Bersama",
      vision: "Mewujudkan masyarakat inklusif yang mendukung penuh tumbuh kembang anak berkebutuhan khusus dan memberdayakan keluarga mereka melalui solidaritas, edukasi, dan advokasi.",
      mission:
        "1. Menyediakan ruang aman bagi orang tua ABK untuk berbagi pengalaman dan dukungan emosional.\n2. Memfasilitasi akses informasi tentang hak, layanan, dan program pendidikan anak berkebutuhan khusus.\n3. Mengadakan kegiatan edukasi, webinar, dan pelatihan keterampilan mengasuh.\n4. Membangun jaringan kerjasama dengan profesional, terapis, dan sekolah inklusi.\n5. Mendorong kesadaran dan penerimaan masyarakat terhadap keberagaman.",
      history:
        "Paguyuban Sahabat ABK didirikan pada tahun 2022 oleh sekelompok orang tua yang memiliki anak berkebutuhan khusus. Berawal dari grup WhatsApp kecil yang anggotanya hanya 10 orang, paguyuban ini kini telah berkembang menjadi komunitas yang aktif dengan lebih dari 200 anggota dari berbagai wilayah di Jabodetabek. Nama 'Sahabat ABK' dipilih untuk mencerminkan semangat persahabatan dan saling mendukung antar anggota dalam perjalanan mendampingi anak-anak istimewa mereka.",
      address: "Jl. Inklusi No. 1, Jakarta Selatan, DKI Jakarta 12345",
      email: "info@sahabatabk.org",
      phone: "021-12345678",
      foundedYear: 2022,
    },
  });

  // ─── BOARD MEMBERS ──────────────────────────────────────────
  console.log("👥 Creating board members...");
  await prisma.boardMember.createMany({
    data: [
      { name: "dr. Kartini Wulandari", position: "Ketua Umum", period: "2024-2026", order: 1 },
      { name: "Ir. Hendra Gunawan", position: "Wakil Ketua", period: "2024-2026", order: 2 },
      { name: "Siti Rahayu, S.Psi", position: "Sekretaris", period: "2024-2026", order: 3 },
      { name: "Diana Puspitasari, SE", position: "Bendahara", period: "2024-2026", order: 4 },
      { name: "Rina Marlina, M.Pd", position: "Koordinator Edukasi", period: "2024-2026", order: 5 },
      { name: "Fajar Nugroho, S.Sos", position: "Koordinator Humas", period: "2024-2026", order: 6 },
      { name: "Lestari Dewi, M.Si", position: "Koordinator Program", period: "2024-2026", order: 7 },
      { name: "Budi Santoso", position: "Koordinator Advokasi", period: "2024-2026", order: 8 },
    ],
  });

  // ─── FORUM CATEGORIES ───────────────────────────────────────
  console.log("💬 Creating forum categories...");
  const catBerbagi = await prisma.forumCategory.create({
    data: { name: "Berbagi Pengalaman", slug: "berbagi-pengalaman", description: "Cerita dan pengalaman mengasuh anak berkebutuhan khusus", icon: "Heart", order: 1 },
  });

  const catRekomendasi = await prisma.forumCategory.create({
    data: { name: "Rekomendasi Terapis & Sekolah", slug: "rekomendasi-terapis-sekolah", description: "Informasi tempat terapi dan sekolah inklusi", icon: "School", order: 2 },
  });

  const catInformasi = await prisma.forumCategory.create({
    data: { name: "Informasi & Hak Anak", slug: "informasi-hak-anak", description: "Hukum, hak, dan program pemerintah untuk ABK", icon: "BookOpen", order: 3 },
  });

  const catTanyaJawab = await prisma.forumCategory.create({
    data: { name: "Tanya Jawab", slug: "tanya-jawab", description: "Tanyakan apa saja tentang pengasuhan ABK", icon: "HelpCircle", order: 4 },
  });

  const catNgobrol = await prisma.forumCategory.create({
    data: { name: "Ngobrol Santai", slug: "ngobrol-santai", description: "Diskusi ringan dan dukungan sesama orang tua", icon: "Coffee", order: 5 },
  });

  // ─── EVENTS ─────────────────────────────────────────────────
  console.log("📅 Creating events...");
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 10);
  const endLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 12);
  const futureDraft = new Date(now.getFullYear(), now.getMonth() + 3, 20);

  const upcomingEvent = await prisma.event.create({
    data: {
      title: "Webinar: Strategi Komunikasi untuk Anak Autisme",
      slug: "webinar-strategi-komunikasi-anak-autisme",
      description:
        "Webinar bersama psikolog anak membahas strategi komunikasi efektif untuk anak dengan spektrum autisme. Materi mencakup teknik visual, social stories, dan augmentative communication.",
      location: "Online via Zoom",
      locationUrl: "https://zoom.us/meeting/example",
      startDate: nextMonth,
      status: EventStatus.PUBLISHED,
      category: "webinar",
      maxParticipants: 150,
      createdBy: admin1.id,
    },
  });

  const completedEvent = await prisma.event.create({
    data: {
      title: "Workshop: Bermain Sambil Belajar di Rumah",
      slug: "workshop-bermain-sambil-belajar",
      description:
        "Workshop interaktif bagi orang tua untuk membuat aktivitas bermain yang edukatif di rumah. Peserta akan membuat sensory bin, art activity, dan motorik games.",
      coverImageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
      location: "Gedung Serbaguna Sahabat ABK, Jakarta",
      startDate: lastMonth,
      endDate: endLastMonth,
      status: EventStatus.COMPLETED,
      category: "workshop",
      maxParticipants: 50,
      createdBy: admin2.id,
    },
  });

  const draftEvent = await prisma.event.create({
    data: {
      title: "Outing: Kunjungan ke Museum Anak",
      slug: "outing-kunjungan-museum-anak",
      description:
        "Kegiatan outing bersama ke Museum Anak untuk stimulasi sensori dan belajar melalui bermain. Acara terbuka untuk seluruh anggota dan keluarga.",
      location: "Museum Anak, Jakarta",
      startDate: futureDraft,
      status: EventStatus.DRAFT,
      category: "outing",
      maxParticipants: 80,
      createdBy: admin1.id,
    },
  });

  // Add gallery images to completed event
  await prisma.eventDocument.createMany({
    data: [
      {
        eventId: completedEvent.id,
        type: "gallery_image",
        url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800",
        caption: "Antusiasme peserta saat workshop",
      },
      {
        eventId: completedEvent.id,
        type: "gallery_image",
        url: "https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800",
        caption: "Membuat sensory bin bersama",
      },
      {
        eventId: completedEvent.id,
        type: "gallery_image",
        url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
        caption: "Aktivitas art untuk motorik halus",
      },
    ],
  });

  // ─── BUDGET TRANSACTIONS ───────────────────────────────────
  console.log("💰 Creating budget transactions...");
  const recentMonth = new Date(now.getFullYear(), now.getMonth() - 1, 5);
  const recentMonth2 = new Date(now.getFullYear(), now.getMonth() - 1, 10);
  const recentMonth3 = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const recentMonth4 = new Date(now.getFullYear(), now.getMonth() - 1, 20);

  await prisma.budgetTransaction.createMany({
    data: [
      // Income
      {
        date: recentMonth,
        type: TransactionType.INCOME,
        category: TransactionCategory.MEMBERSHIP_FEE,
        description: "Iuran anggota bulan Januari (15 anggota)",
        amount: 1500000,
        isVerified: true,
        createdBy: admin1.id,
      },
      {
        date: recentMonth2,
        type: TransactionType.INCOME,
        category: TransactionCategory.DONATION,
        description: "Donasi dari PT Maju Bersama",
        amount: 5000000,
        isVerified: true,
        createdBy: admin1.id,
      },
      {
        date: recentMonth3,
        type: TransactionType.INCOME,
        category: TransactionCategory.EVENT_INCOME,
        description: "Pendaftaran workshop Desember",
        amount: 2500000,
        isVerified: true,
        createdBy: admin2.id,
      },
      // Expenses
      {
        date: recentMonth,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OPERATIONAL,
        description: "Sewa ruang pertemuan bulanan",
        amount: 1500000,
        isVerified: true,
        createdBy: admin1.id,
      },
      {
        date: recentMonth2,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EVENT_EXPENSE,
        description: "Konsumsi workshop (snack & makan siang)",
        amount: 1200000,
        isVerified: true,
        createdBy: admin2.id,
      },
      {
        date: recentMonth3,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.SOCIAL_PROGRAM,
        description: "Bantuan alat terapi untuk 3 anak",
        amount: 3000000,
        isVerified: true,
        createdBy: admin1.id,
      },
      {
        date: recentMonth4,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OPERATIONAL,
        description: "Biaya cetak materi edukasi",
        amount: 500000,
        isVerified: true,
        createdBy: admin2.id,
      },
      {
        date: recentMonth4,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OTHER,
        description: "Biaya administrasi bank",
        amount: 75000,
        isVerified: true,
        createdBy: admin1.id,
      },
      // Recent month transactions
      {
        date: new Date(now.getFullYear(), now.getMonth(), 3),
        type: TransactionType.INCOME,
        category: TransactionCategory.MEMBERSHIP_FEE,
        description: "Iuran anggota bulan Februari (18 anggota)",
        amount: 1800000,
        isVerified: true,
        createdBy: admin1.id,
      },
      {
        date: new Date(now.getFullYear(), now.getMonth(), 7),
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OPERATIONAL,
        description: "Sewa ruang pertemuan bulan Februari",
        amount: 1500000,
        isVerified: true,
        createdBy: admin1.id,
      },
    ],
  });

  // ─── FORUM THREADS & COMMENTS ───────────────────────────────
  console.log("📝 Creating forum threads and comments...");

  const thread1 = await prisma.forumThread.create({
    data: {
      title: "Pengalaman pertama kali diagnosis autisme pada anak",
      content:
        "Halo semuanya, saya ingin berbagi pengalaman. Bulan lalu anak saya (4 tahun) resmi didiagnosis autisme. Awalnya saya sangat shock dan tidak bisa menerima. Tapi setelah bergabung di sini dan banyak baca sharing dari teman-teman, saya mulai bisa menerima dan fokus mencari cara terbaik untuk mendukung perkembangan anak saya.\n\nSaat ini anak saya sudah mulai terapi ABA 3x seminggu dan sudah ada kemajuan signifikan. Anak saya sudah bisa kontak mata lebih lama dan mulai bisa mengikuti instruksi sederhana.\n\nUntuk teman-teman yang baru dapat diagnosis, jangan menyerah ya. Kita tidak sendiri!",
      categoryId: catBerbagi.id,
      authorId: member1.id,
      isPinned: true,
    },
  });

  await prisma.forumComment.createMany({
    data: [
      {
        threadId: thread1.id,
        authorId: member2.id,
        content:
          "Terima kasih sudah berbagi, Mbak Dewi. Saya juga mengalami hal yang sama. Anak saya didiagnosis 2 tahun lalu. Sekarang sudah jauh lebih baik. Semangat ya!",
      },
      {
        threadId: thread1.id,
        authorId: member3.id,
        content:
          "Setuju banget, Mbak. Yang penting kita tetap positif dan konsisten dengan terapi. Anak-anak kita luar biasa, mereka hanya butuh cara yang berbeda untuk belajar.",
      },
    ],
  });

  // Add reactions to thread1
  await prisma.forumReaction.createMany({
    data: [
      { threadId: thread1.id, userId: member2.id, type: "like" },
      { threadId: thread1.id, userId: member3.id, type: "like" },
      { threadId: thread1.id, userId: admin1.id, type: "heart" },
    ],
  });

  const thread2 = await prisma.forumThread.create({
    data: {
      title: "Rekomendasi terapis wicara area Jakarta Selatan?",
      content:
        "Halo teman-teman, ada yang bisa rekomendasikan terapis wicara yang bagus di area Jakarta Selatan? Anak saya (5 tahun) masih butuh banyak bantuan untuk perkembangan berbicaranya. Budget sekitar 150-250rb per sesi. Terima kasih sebelumnya!",
      categoryId: catRekomendasi.id,
      authorId: member4.id,
    },
  });

  await prisma.forumComment.create({
    data: {
      content:
        "Saya rekomendasikan Klinik Tumbuh Kembang di daerah Kemang. Terapisnya sabar dan berpengalaman. Tarifnya sekitar 200rb/sesi. Anak saya terapi di sana selama 6 bulan dan sudah ada kemajuan.",
      thread: { connect: { id: thread2.id } },
      author: { connect: { id: member1.id } },
    },
  });

  const thread3 = await prisma.forumThread.create({
    data: {
      title: "Tips mengajar anak ABK di rumah ala rumahan?",
      content:
        "Hai moms & dads, ada yang punya tips atau activity ideas untuk stimulasi anak di rumah? Anak saya suka banget sama aktivitas yang melibatkan air dan pasir. Mau cari ide lainnya biar tidak bosan. Thank you!",
      categoryId: catNgobrol.id,
      authorId: member5.id,
    },
  });

  await prisma.forumComment.create({
    data: {
      content:
        "Anak saya juga suka air! Coba deh buat aktivitas sorting benda di air, atau permainan tebak warna pakai pewarna makanan. Anak saya senang banget kalau main air dan tidak sadar sudah belajar banyak hal!",
      thread: { connect: { id: thread3.id } },
      author: { connect: { id: member3.id } },
    },
  });

  // ─── RSVPs ─────────────────────────────────────────────────
  console.log("🎫 Creating RSVPs...");
  await prisma.eventRsvp.createMany({
    data: [
      { eventId: upcomingEvent.id, userId: member1.id },
      { eventId: upcomingEvent.id, userId: member2.id },
      { eventId: upcomingEvent.id, userId: member3.id },
      { eventId: completedEvent.id, userId: member1.id },
      { eventId: completedEvent.id, userId: member2.id },
      { eventId: completedEvent.id, userId: member3.id },
      { eventId: completedEvent.id, userId: admin1.id },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("📊 Summary:");
  console.log(`   - 1 SUPER_ADMIN: admin@sahabatabk.org`);
  console.log(`   - 2 ADMIN users: admin1@sahabatabk.org, admin2@sahabatabk.org`);
  console.log(`   - 5 MEMBER users: 3 active, 2 pending`);
  console.log(`   - 1 Organization Profile`);
  console.log(`   - 8 Board Members`);
  console.log(`   - 5 Forum Categories`);
  console.log(`   - 3 Events (1 upcoming, 1 completed, 1 draft)`);
  console.log(`   - 10 Budget Transactions`);
  console.log(`   - 3 Forum Threads with comments and reactions`);
  console.log("");
  console.log("🔑 Login credentials:");
  console.log(`   - Admin: admin@sahabatabk.org / admin123`);
  console.log(`   - Member: dewi.anggraini@email.com / member123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
