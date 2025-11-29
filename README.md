# 🚛 Mobile Carb Check - CARB Compliance App

**California's Premier Mobile CARB Compliance Application**
Version: 0.1.0 (Alpha) | Phase: Mobile Web

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bgillis99-pixel/FINALVINDIESEL)

## 📱 Overview

Mobile Carb Check is a Progressive Web App (PWA) for heavy-duty diesel vehicle operators to comply with California Air Resources Board (CARB) regulations.

**Target Vehicles:**
- Heavy-Duty Diesel Trucks >14,000 lbs GVWR
- Diesel Motorhomes and RVs
- Agricultural Equipment with diesel engines
- **NO GASOLINE VEHICLES**

## ✨ Features

- ✅ **Instant VIN Compliance Checks**
- 🤖 **AI Chat Assistant** (Google Gemini)
- 📸 **Media Analysis Tools**
- 👤 **User Profiles & History**
- 📱 **PWA Installation**
- 🌐 **Offline Support**
- 📞 **Mobile Service**: 844-685-8922

## 🚀 Deployment to Vercel

### Quick Deploy

1. Click "Deploy with Vercel" button above, OR
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import: `bgillis99-pixel/FINALVINDIESEL`
4. Configure:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variable: `API_KEY` (Google AI Studio)
6. Deploy!

### Environment Variables

In Vercel dashboard, add:
- **Key**: `API_KEY`
- **Value**: Your Google Gemini API key from [ai.google.dev](https://ai.google.dev/)

### Squarespace Integration

#### Full Page Embed
```html
<iframe
  src="https://your-vercel-app.vercel.app"
  style="width:100%; height:100vh; border:none;"
  title="Mobile Carb Check"
></iframe>
```

#### Widget Embed
```html
<div style="max-width: 600px; margin: 0 auto;">
  <iframe
    src="https://your-vercel-app.vercel.app"
    style="width:100%; height:800px; border:2px solid #003366; border-radius:12px;"
  ></iframe>
</div>
```

## 🛠️ Local Development

```bash
git clone https://github.com/bgillis99-pixel/FINALVINDIESEL.git
cd FINALVINDIESEL
npm install
cp .env.example .env  # Add your API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
FINALVINDIESEL/
├── src/
│   ├── components/
│   │   ├── VinChecker.tsx
│   │   ├── ChatAssistant.tsx
│   │   ├── MediaTools.tsx
│   │   ├── ProfileView.tsx
│   │   └── AdminView.tsx
│   ├── types.ts
│   └── App.tsx
├── public/manifest.json
├── index.html
├── vite.config.ts
└── package.json
```

## 🔑 Tech Stack

- **Framework**: Vite + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Deployment**: Vercel

## 📱 PWA Features

- Installable on all platforms
- Offline-capable
- Push notifications (coming soon)
- Share Target support

## 📞 Contact & Support

- **Phone**: 844-685-8922
- **Email**: info@carbcleantruckcheck.app
- **Website**: https://carbcleantruckcheck.app
- **Service**: All of California

## 📈 Roadmap

- ✅ Phase 1: Mobile Web (Current)
- 🔄 Phase 2: Enhanced Features (Q1 2026)
- 🔄 Phase 3: Native Apps (Q2 2026)

## 📄 License

MIT License © 2025 Mobile Carb Check

**Built with React + Vite + Tailwind + Google Gemini**
