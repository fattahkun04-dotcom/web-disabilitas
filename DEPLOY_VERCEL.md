# 🚀 Panduan Deploy ke Vercel

## Prasyarat

1. Akun Vercel (gratis) di [vercel.com](https://vercel.com)
2. Database MySQL/PostgreSQL yang sudah online (bukan localhost)
3. Code di-push ke GitHub/GitLab/Bitbucket

---

## Langkah 1: Persiapan Database

### Opsi A: Menggunakan Database MySQL Online

**Rekomendasi: Railway, PlanetScale, atau Aiven**

#### Railway (Mudah & Gratis $5/bulan)
1. Daftar di [railway.app](https://railway.app)
2. Klik "New Project" → "Add a Database" → "Add MySQL"
3. Copy connection string dari Railway
4. Format: `mysql://user:password@host:port/database`

#### PlanetScale (Gratis & Populer)
1. Daftar di [planetscale.com](https://planetscale.com)
2. Buat database baru
3. Copy connection string dari "Connect" → "Prisma"
4. Format: `mysql://user:password@host:port/database?sslaccept=strict`

---

## Langkah 2: Setup di Vercel

### Cara 1: Deploy via Dashboard (Recommended)

1. **Buka [vercel.com](https://vercel.com) dan login**

2. **Import Project**
   - Klik "Add New..." → "Project"
   - Pilih repository GitHub Anda
   - Klik "Import"

3. **Konfigurasi Project**
   - **Framework Preset**: Next.js (otomatis)
   - **Build Command**: `npx prisma generate && next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Environment Variables** (WAJIB DIISI)
   Klik "Environment Variables" dan tambahkan:

   ```
   DATABASE_URL=mysql://user:password@host:port/database
   
   NEXTAUTH_SECRET=random-string-yang-panjang-dan-aman
   NEXTAUTH_URL=https://your-domain.vercel.app
   
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   RESEND_API_KEY=your-resend-api-key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

5. **Deploy**
   - Klik "Deploy"
   - Tunggu build selesai (~3-5 menit)
   - Selesai! 🎉

---

### Cara 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login ke Vercel**
   ```bash
   vercel login
   ```

3. **Deploy (Preview)**
   ```bash
   vercel
   ```

4. **Deploy ke Production**
   ```bash
   vercel --prod
   ```

5. **Setup Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add CLOUDINARY_CLOUD_NAME
   vercel env add CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   vercel env add RESEND_API_KEY
   vercel env add RESEND_FROM_EMAIL
   ```

---

## Langkah 3: Setup Database di Vercel

### Setelah Deploy Pertama Kali:

1. **Buka Vercel Dashboard**
2. **Pilih Project Anda**
3. **Pergi ke Settings → Storage**
4. **Tambahkan Database** (opsional, bisa pakai external DB)

### Atau Pakai External Database:

1. **Buat database di Railway/PlanetScale**
2. **Copy connection string**
3. **Paste ke Environment Variables di Vercel**
4. **Redeploy**

---

## Langkah 4: Jalankan Migration

Setelah deploy, jalankan Prisma migration:

### Opsi A: Via Vercel Remote CLI
```bash
vercel env pull .env.production
npx prisma db push --schema=prisma/schema.prisma
```

### Opsi B: Via Script di Project (Recommended)

Buat file `scripts/deploy-db.js`:
```javascript
const { execSync } = require('child_process');

async function deployDatabase() {
  console.log('🚀 Running Prisma migration...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

deployDatabase();
```

Jalankan lokal setelah set DATABASE_URL ke production:
```bash
node scripts/deploy-db.js
```

---

## Langkah 5: Generate NEXTAUTH_SECRET

Buat secret key yang aman:

```bash
openssl rand -base64 32
```

Atau pakai website: [randomkeygen.com](https://randomkeygen.com)

Copy hasilnya dan paste ke `NEXTAUTH_SECRET` di Vercel.

---

## Langkah 6: Setup Custom Domain (Opsional)

1. **Buka Vercel Dashboard → Project**
2. **Settings → Domains**
3. **Add Domain**: `yourdomain.com`
4. **Setup DNS Records** di domain registrar:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
5. **Tunggu propagasi DNS** (bisa 1-48 jam)

---

## Environment Variables Lengkap

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `DATABASE_URL` | Connection string database | `mysql://user:pass@host:3306/db` |
| `NEXTAUTH_SECRET` | Secret key untuk autentikasi | `aHR0cHM6Ly93d3cueW91dHViZS5jb20=` |
| `NEXTAUTH_URL` | URL aplikasi Anda | `https://your-app.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dxxxxxxx` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `xxxxxxxxxxxxxxxxxxxx` |
| `RESEND_API_KEY` | Resend email API key | `re_xxxxxxxxxxxxx` |
| `RESEND_FROM_EMAIL` | Email pengirim | `noreply@yourdomain.com` |

---

## Troubleshooting

### ❌ Error: "Can't reach database server"

**Solusi:**
- Pastikan `DATABASE_URL` benar
- Pastikan database sudah online (bukan localhost)
- Cek firewall/allowlist IP Vercel

### ❌ Error: "Module not found: bcrypt"

**Sudah diatasi** di `next.config.js` dengan externals config.

### ❌ Error: "NEXTAUTH_SECRET is required"

**Solusi:**
- Generate secret baru
- Paste ke Environment Variables Vercel
- Redeploy

### ❌ Build berhasil tapi 500 error saat akses

**Solusi:**
- Cek Vercel Logs (Functions tab)
- Pastikan semua env variables sudah terisi
- Cek connection string database

### ❌ Email tidak terkirim

**Solusi:**
- Pastikan `RESEND_API_KEY` benar
- Verifikasi domain di Resend dashboard
- Cek spam folder

---

## Update Setelah Deploy

Setiap kali push ke branch `main` (atau branch production):
- Vercel otomatis deploy
- Tunggu 2-5 menit
- Update live! 🎉

Untuk preview branch lain:
- Push ke branch selain `main`
- Vercel buat preview URL otomatis
- Bisa test sebelum merge

---

## Tips Optimasi

1. **Gunakan database yang dekat dengan region Vercel** (US East)
2. **Setup caching** untuk query yang sering dipakai
3. **Optimize images** sebelum upload ke Cloudinary
4. **Pakai Vercel Analytics** untuk monitoring
5. **Setup Error Monitoring** dengan Sentry

---

## Checklist Deploy

- [ ] Database online dan accessible
- [ ] Semua environment variables terisi
- [ ] NEXTAUTH_SECRET sudah di-generate
- [ ] DATABASE_URL format benar
- [ ] Prisma schema sudah push ke production
- [ ] Build berhasil di Vercel
- [ ] Test login & register
- [ ] Test fitur utama aplikasi
- [ ] Setup custom domain (opsional)
- [ ] Setup monitoring (opsional)

---

## Link Penting

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [PlanetScale](https://planetscale.com)
- [Railway](https://railway.app)
- [Resend](https://resend.com)
- [Cloudinary](https://cloudinary.com)

---

**Butuh bantuan?** Buka Vercel Logs atau cek dokumentasi resmi di atas.
