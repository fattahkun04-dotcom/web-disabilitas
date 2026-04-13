# 🚀 Quick Deploy ke Vercel

## 3 Langkah Cepat

### 1️⃣ Siapkan Database Online

**Pilihan gratis:**
- [Railway](https://railway.app) - MySQL gratis $5/bulan
- [PlanetScale](https://planetscale.com) - MySQL gratis & populer
- [Supabase](https://supabase.com) - PostgreSQL gratis

**Setelah buat database, copy connection string:**
```
DATABASE_URL=mysql://user:password@host:port/database
```

---

### 2️⃣ Deploy di Vercel

1. **Buka** [vercel.com/new](https://vercel.com/new)
2. **Login** dengan GitHub
3. **Import** repository Anda
4. **Isi Environment Variables**:

```
DATABASE_URL=mysql://user:password@host:port/database
NEXTAUTH_SECRET=<generate-random-string-panjang>
NEXTAUTH_URL=https://your-project.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

5. **Klik Deploy** 🎉

---

### 3️⃣ Setup Database

**Cara Mudah (via Vercel CLI):**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Pull environment dari Vercel
vercel env pull .env.production

# Push database schema
npm run db:deploy
```

**Cara Manual:**

```bash
# Set DATABASE_URL lokal ke production DB
# Jalankan migration
npx prisma db push
```

---

## Generate NEXTAUTH_SECRET

```bash
# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Atau pakai website
https://generate-secret.vercel.app/32
```

---

## Cek Setelah Deploy

- [ ] ✅ Build berhasil di Vercel
- [ ] ✅ Bisa akses homepage
- [ ] ✅ Bisa login
- [ ] ✅ Bisa register
- [ ] ✅ Database connected
- [ ] ✅ Fitur utama jalan normal

---

## Jika Ada Error

### "Can't reach database server"
- Cek `DATABASE_URL` sudah benar
- Pastikan database sudah online (bukan localhost)
- Cek format: `mysql://user:pass@host:port/db`

### "NEXTAUTH_SECRET is required"
- Generate secret baru
- Paste ke Vercel Environment Variables
- Redeploy

### Build gagal
- Cek Vercel Logs (tab "Functions")
- Pastikan `vercel.json` ada di project
- Cek dependency di `package.json`

---

## Update Aplikasi

Setiap kali **push ke GitHub**:
```bash
git add .
git commit -m "update fitur"
git push
```

Vercel **otomatis deploy** dalam 2-5 menit! 🎉

---

## Link Penting

| Service | Link |
|---------|------|
| Vercel Dashboard | [vercel.com/dashboard](https://vercel.com/dashboard) |
| Vercel Docs | [vercel.com/docs](https://vercel.com/docs) |
| Railway (DB) | [railway.app](https://railway.app) |
| PlanetScale (DB) | [planetscale.com](https://planetscale.com) |
| Cloudinary | [cloudinary.com](https://cloudinary.com) |
| Resend (Email) | [resend.com](https://resend.com) |

---

## Tips

💡 **Pakai Railway untuk database** - paling mudah setup  
💡 **Selalu cek Vercel Logs** jika ada error  
💡 **NEXTAUTH_SECRET harus panjang** - minimal 32 karakter  
💡 **NEXTAUTH_URL harus HTTPS** - bukan HTTP  
💡 **Test setelah deploy** - jangan langsung tutup browser  

---

**Butuh bantuan lengkap?** Baca: `DEPLOY_VERCEL.md`
