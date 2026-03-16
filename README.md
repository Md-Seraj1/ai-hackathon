# TryOnMe ![GitHub](https://img.shields.io/github/license/yourusername/tryonme?style=for-the-badge) [![npm](https://img.shields.io/npm/v/tryonmemobileapp2?logo=npm)](https://www.npmjs.com/package/tryonmemobileapp2) [![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![Vite](https://img.shields.io/badge/Vite-7-green?logo=vite)](https://vitejs.dev/) [![Supabase](https://img.shields.io/badge/Supabase-F03A47?logo=supabase)](https://supabase.com/) [![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind)](https://tailwindcss.com/)

## 🚀 AI-Powered Virtual Try-On E-Commerce Platform

**TryOnMe** is a production-ready, mobile-first e-commerce application featuring cutting-edge AI Virtual Try-On capabilities. Built with modern React stack and Supabase backend, it offers Amazon-style shopping experience with real-time cart, admin dashboard, and seamless mobile deployment via Capacitor.

[![Demo Video](https://img.shields.io/badge/Demo-Video-ff0000?logo=youtube)](<ppts%20and%20video/Demo%20Video%20(1).mp4>) <!-- Upload to GitHub/YouTube for live badge -->

### ✨ Key Features

| Feature                     | Description                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| **🛍️ Full E-Commerce Flow** | Browse categories, search products, detailed views, cart, wishlist, checkout, orders history |
| **🤳 AI Virtual Try-On**    | Real-time try-on using NanoBanana API + Supabase `tryon_sessions` storage                    |
| **📱 Mobile-First**         | Touch-optimized UI with Framer Motion animations, Capacitor Android ready                    |
| **👨‍💼 Admin Panel**          | Dashboard, manage products/variants/ratings/users/orders, AI Try-On controls                 |
| **⚡ Real-Time**            | Zustand state + TanStack Query caching + Supabase Realtime                                   |
| **🔒 Secure**               | Supabase Auth + RLS policies on all tables                                                   |
| **📊 Responsive**           | TailwindCSS + Lucide icons, works on all devices                                             |

**Screenshots** (add images to /public/screenshots/):

- ![Home](public/screenshots/home.png)
- ![Try-On](public/screenshots/tryon.png)
- ![Admin](public/screenshots/admin.png)

## 🛠️ Tech Stack

| Category         | Technologies                                         |
| ---------------- | ---------------------------------------------------- |
| **Frontend**     | React 19, Vite 7, React Router                       |
| **Styling**      | Tailwind CSS 3.4, Framer Motion, clsx/tailwind-merge |
| **State & Data** | Zustand 5, TanStack Query 5, React Hook Form         |
| **Backend**      | Supabase (Auth, PostgREST, Realtime, Storage), RLS   |
| **Mobile**       | Capacitor 8 (Android)                                |
| **Utils**        | Lucide React, date-fns, nanoBananaApi                |
| **Dev**          | ESLint 9, PostCSS                                    |

## 🚀 Quick Start

### Prerequisites

- Node.js >=20
- [Supabase Account](https://supabase.com/)
- [NanoBanana API Key](https://nanobanana.pro/) (for AI Try-On)

### 1. Clone & Install

```bash
git clone <your-repo> tryonme
cd tryonme
npm install
```

### 2. Environment Variables

Create `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NANO_BANANA_API_KEY=your_ai_api_key
```

### 3. Database Setup

1. Supabase Dashboard → SQL Editor
2. Run `supabase/schema.sql` + `supabase/seed.sql`
3. Enable RLS (auto via schema)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
tryonme/
├── public/          # Static assets
├── src/
│   ├── components/  # UI (Layout, ProductCard, AdminSidebar...)
│   ├── lib/         # Utils (supabase.js, store.js, nanoBananaApi.js, virtualTryOnApi.js)
│   ├── pages/       # Routes (Home, Cart, TryOn, Admin/*, Auth/*)
│   └── assets/      # React/Vite SVGs
├── supabase/        # DB (schema.sql, seed.sql, migrations)
├── android/         # Capacitor mobile
├── package.json     # tryonmemobileapp2
└── README.md        # You're reading it!
```

## 🧪 AI Virtual Try-On Integration

1. Get API key from NanoBanana Pro
2. `src/lib/virtualTryOnApi.js` handles sessions
3. `src/pages/TryOn.jsx` - implement camera/canvas logic
4. Sessions stored in Supabase `tryon_sessions` (user_id, image_url, timestamp)
5. Admin: `src/pages/admin/AiTryOn.jsx` for management

**Placeholder in TryOn.jsx** - ready for your AI model!

## 📲 Mobile Build (Capacitor)

```bash
npm install @capacitor/core @capacitor/android @capacitor/cli
npx cap sync
npx cap add android
npx cap open android  # Android Studio
```

Build APK: Android Studio → Build → Generate Signed Bundle/APK

## ☁️ Deployment

### Web (Vercel/Netlify)

1. `npm run build`
2. Deploy dist/ + env vars

### Mobile Stores

- Use Capacitor for Android/iOS submission

## 🧑‍💻 Local Development

| Script            | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Development server       |
| `npm run build`   | Production build         |
| `npm run lint`    | ESLint check             |
| `npm run preview` | Local production preview |

**Code Style**: ESLint + Prettier. Use `git commit -m "feat: ..."` (commitizen ready).

## 🧪 Testing

Add Vitest/Jest:

```bash
npm install -D vitest @testing-library/react
```

## 🤝 Contributing

1. Fork → Clone → Create branch (`git checkout -b feat/amazing`)
2. Commit → Push → PR to `main`
3. Issues: [Create New](https://github.com/yourusername/tryonme/issues)

**Note**: Update Supabase schema before PR.

## 📄 License

MIT License - see [LICENSE](LICENSE) (create if missing).

## 🙌 Acknowledgments

- [Supabase](https://supabase.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Capacitor](https://capacitorjs.com/)

⭐ **Star on GitHub** | 🐛 [Bug?](https://github.com/yourusername/tryonme/issues/new) | 💬 [Discuss](https://github.com/yourusername/tryonme/discussions)

---

_Built for AI Hackathon - VirtuFit inspired (virtufit.pptx). Demo Video: ppts and video/Demo Video (1).mp4_
