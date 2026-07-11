# Deploy MyAssist — FrontEnd (Vercel)

Web Next.js di-deploy ke [Vercel](https://vercel.com). API di-proxy ke BackEnd Render agar **auth cookie** tetap berfungsi.

Repo: [varseeker/myassist-frontend](https://github.com/varseeker/myassist-frontend)

---

## 1. Push kode ke GitHub

```bash
cd FrontEnd
git add .
git commit -m "Prepare production deploy"
git push -u origin main
```

---

## 2. Import project di Vercel

1. Login [vercel.com](https://vercel.com)
2. **Add New → Project**
3. Import repo `varseeker/myassist-frontend`
4. Framework: **Next.js** (auto-detect)
5. Root Directory: `./` (default)

---

## 3. Environment Variables (Vercel Dashboard)

Set di **Settings → Environment Variables** (Production):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `/api/v1` |
| `BACKEND_URL` | URL backend Render, mis. `https://myassist-backend.onrender.com` |
| `NEXT_PUBLIC_WS_URL` | **Sama** dengan URL backend Render (WebSocket langsung ke API) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key |
| `NEXT_PUBLIC_SUPABASE_JWKS_URL` | JWKS URL Supabase |

> `BACKEND_URL` **tanpa** slash di akhir.  
> `NEXT_PUBLIC_API_URL=/api/v1` memakai proxy same-origin (lihat `next.config.ts`).

---

## 4. Deploy

Klik **Deploy**. Setelah selesai, URL production: `https://<project>.vercel.app`

---

## 5. Update BackEnd CORS

Kembali ke Render → Environment Variables BackEnd:

```
CORS_ORIGIN=https://<project>.vercel.app
```

Redeploy backend jika perlu.

---

## Arsitektur production

```
Browser
  ├─ HTTPS /api/v1/*  → Vercel rewrite → Render BackEnd (cookie auth)
  └─ WSS  /realtime    → Render BackEnd (token auth)
```

Database & file storage tetap di **Supabase**.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Login gagal / redirect loop | Pastikan `BACKEND_URL` benar & `CORS_ORIGIN` di backend = URL Vercel |
| API 502 | Backend Render mungkin sleep (Free tier) — tunggu ~30 detik |
| WebSocket tidak connect | Cek `NEXT_PUBLIC_WS_URL` = URL backend |
| Upload gagal | Pastikan Supabase storage key & bucket di backend |
| `npm ci` lock file sync error | `vercel.json` pakai `npm install`; atau update Install Command di Vercel Settings |
