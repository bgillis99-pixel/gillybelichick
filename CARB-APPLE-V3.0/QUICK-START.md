# ⚡ QUICK START - Mobile CARB Check

**Get running in 5 minutes**

---

## 🎯 You Chose: React Native (Cross-Platform)

**ONE codebase → iOS + Android**

---

## ✅ Step 1: Prerequisites

### Mac Users (iOS + Android)
```bash
# Install Xcode (free from Mac App Store)
# Install Node.js
brew install node
```

### Windows/Linux Users (Android only)
```bash
# Install Node.js from nodejs.org
# Install Android Studio
```

---

## ✅ Step 2: Setup Project

```bash
cd CARB-APPLE-V3.0/React-Native-CrossPlatform/MobileCarbCheck

# Install dependencies
npm install

# Start development server
npx expo start
```

---

## ✅ Step 3: Run App

### On iOS (Mac only)
Press `i` in terminal → iOS Simulator opens

### On Android
Press `a` in terminal → Android Emulator opens

### On Your Phone (iOS or Android)
1. Install "Expo Go" from App Store / Play Store
2. Scan QR code from terminal
3. App opens instantly!

---

## 🎉 That's It!

You should now see:
- **Dashboard** with Tesla-style design
- **Glass cards** with frosted blur
- **Next appointment** card
- **Stats** (6 tests, $10,350 revenue)
- **Quick actions** buttons

---

## 🔧 What to Add Next

### 1. VIN Scanner (I'll generate this)
```bash
npm install expo-camera
```

### 2. API Keys
Create `.env` file:
```
GEMINI_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here
TWILIO_SID=your_sid_here
```

### 3. Push Notifications
```bash
npm install expo-notifications
```

---

## 📱 Deploy to App Stores

### One-Time Setup
```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Build & Submit
```bash
# iOS
eas build --platform ios
eas submit --platform ios

# Android
eas build --platform android
eas submit --platform android
```

**Timeline:**
- First build: ~20 minutes
- Subsequent builds: ~10 minutes
- App Store review: 2-4 weeks
- Play Store review: 1-2 days

---

## 💰 Costs

| Item | Cost |
|------|------|
| Apple Developer | $99/year |
| Google Play | $25 one-time |
| Expo (optional) | Free (or $29/mo for faster builds) |
| APIs (Gemini, Claude, Twilio) | ~$57/mo |

**Total to launch:** $124 + $57/mo

---

## 🆘 Problems?

**Can't run iOS Simulator?**
- Make sure Xcode is installed
- Run: `sudo xcode-select --switch /Applications/Xcode.app`

**Can't run Android?**
- Open Android Studio
- Tools → AVD Manager → Create Virtual Device

**Dependencies error?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Still stuck?**
- Check: `/React-Native-CrossPlatform/README.md`
- Or just ask me!

---

## 📞 What Do You Want to Build Next?

**A) VIN Scanner** - Camera + OCR for VIN detection
**B) API Integration** - Connect Gemini, Claude, Twilio
**C) Test Flow** - Complete test workflow (VIN → photos → result → report)
**D) Push Notifications** - Lead alerts, payment confirmations

**Tell me and I'll generate the code!** 🚀
