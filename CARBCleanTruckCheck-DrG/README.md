# 🚛 CARB Clean Truck Check - Dr. G

**AI-Powered CARB Compliance Testing for California Diesel Vehicles**

Version 1.0.0 | React Native (iOS + Android)

---

## 🎯 Overview

This is a **NEW** project variant for A/B testing alongside the existing CARB app implementations. Built with:

- ✅ **React Native + Expo** - Single codebase for iOS & Android
- ✅ **Tesla-Inspired Design** - Dark mode, glass cards, premium UX
- ✅ **Dr. G AI Assistant** - Gemini-powered CARB expert
- ✅ **VIN Scanner** - Camera + OCR for instant compliance checks
- ✅ **Production Ready** - EAS Build configured for app stores

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for physical device testing)

### Install & Run

```bash
cd CARBCleanTruckCheck-DrG
npm install
npx expo start
```

**Then:**
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

---

## 📦 Features

### 🏠 Dashboard
- Real-time testing stats (tests today, revenue)
- Quick actions (Scan VIN, Ask Dr. G)
- Recent test history
- Glass card UI with blur effects

### 🤖 Dr. G AI Assistant
- Gemini-powered chat interface
- CARB compliance expert knowledge
- Quick question shortcuts
- Real-time responses

### 📸 VIN Scanner
- Camera-based scanning
- OCR text recognition (ready for integration)
- Tesla-style scanning animation
- Instant VIN validation

### ⚙️ Settings
- User profile management
- Notification preferences
- Subscription status (Tester Pro $199/year)
- Analytics & reports access

---

## 📱 App Identifiers

**iOS:**
- Bundle ID: `com.carbcleantruckcheck.drg`
- Display Name: CARB Clean Truck Check

**Android:**
- Package: `com.carbcleantruckcheck.drg`
- Version Code: 1

---

## 🎨 Design System

### Colors (Tesla-Inspired)
```typescript
teslaBlack: '#0A0A0F'      // Deep black background
teslaGray: '#1A1A1F'       // Card backgrounds
teslaBlue: '#3B82F6'       // Primary accent
drGGreen: '#00C853'        // Dr. G signature green
```

### Components
- **GlassCard**: Frosted glass effect with blur
- **Bottom Tabs**: Tesla-style navigation
- **Haptic Feedback**: Touch vibrations throughout

---

## 🔧 Configuration

### API Integration

Add to `app.json`:
```json
"extra": {
  "geminiApiKey": "YOUR_GEMINI_API_KEY_HERE"
}
```

### EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

---

## 📊 A/B Testing Strategy

This variant tests:
- **Dr. G branding** vs generic AI assistant
- **Green accent color** vs blue-only palette
- **Dashboard-first** vs VIN scanner-first flow
- **Subscription messaging** placement

Compare against:
- `CARB-APPLE-V3.0/React-Native-CrossPlatform`
- `CARB-APPLE-V3.0/iOS-Native`

---

## 🚢 Deployment

### To Google Play Store
1. Build: `eas build --platform android --profile production`
2. Download APK/AAB from Expo dashboard
3. Upload to Google Play Console
4. Set pricing: Free + IAP ($199/year, $2,000/year)

### To Apple App Store
1. Build: `eas build --platform ios --profile production`
2. Download IPA from Expo dashboard
3. Upload to App Store Connect via Transporter
4. Set pricing: Free + IAP ($199/year, $2,000/year)

---

## 💰 Pricing Tiers

### Free Tier
- 3 VIN lookups/day
- Basic compliance info
- Limited Dr. G access

### Tester Pro - $199/year
- Unlimited VIN scans
- Full Dr. G AI assistant
- Photo analysis
- PDF reports
- Offline mode

### Business Exclusive - $2,000/year
- Everything in Tester Pro
- 50-mile territory exclusivity
- 100 guaranteed leads/year
- CRM integration
- Branded reports
- Multi-user licenses

---

## 📁 Project Structure

```
CARBCleanTruckCheck-DrG/
├── App.tsx                    # Main navigation
├── app.json                   # Expo config
├── package.json               # Dependencies
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── DrGScreen.tsx
│   │   ├── VINScannerScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   └── GlassCard.tsx
│   └── theme/
│       └── colors.ts
└── assets/
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

---

## 🔑 Next Steps

### Immediate
- [ ] Add Gemini API integration to Dr. G
- [ ] Implement real OCR for VIN scanner
- [ ] Create app icons and splash screens
- [ ] Set up EAS project ID

### Week 1
- [ ] Connect to backend API
- [ ] Implement user authentication
- [ ] Add payment/subscription flow
- [ ] Beta test with 10 real testers

### Week 2
- [ ] Submit to App Store & Play Store
- [ ] Set up analytics tracking
- [ ] Launch marketing campaign
- [ ] Compare A/B test results

---

## 📞 Support

- **Email**: info@carbcleantruckcheck.app
- **Phone**: 844-685-8922
- **Website**: https://carbcleantruckcheck.app

---

## 📄 License

MIT License © 2025 CARB Clean Truck Check

**Built with React Native + Expo + Tesla Design Principles**
