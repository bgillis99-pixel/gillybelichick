# 🚀 React Native Cross-Platform App

**ONE codebase → iOS + Android**

---

## ⚡ Quick Start (5 Minutes)

```bash
cd MobileCarbCheck
npm install
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

---

## 📱 What Works Right Now

✅ **Dashboard** - Tesla-style glass cards, stats, quick actions
✅ **Notifications** - Lead alerts, payment confirmations
✅ **Settings** - Profile, preferences
✅ **Navigation** - Bottom tabs with icons
✅ **Dark Mode** - Tesla colors (#0A0A0F deep black)
✅ **Glass Effects** - Frosted blur, neumorphism

---

## 🔧 Setup (First Time)

### 1. Install Node.js
```bash
# Check if installed
node --version

# If not, install from nodejs.org or:
brew install node
```

### 2. Install Dependencies
```bash
cd MobileCarbCheck
npm install
```

### 3. Run App
```bash
npx expo start
```

**iOS:**
- Xcode Simulator opens automatically
- Or press `i` in terminal

**Android:**
- Android Studio Emulator must be running
- Or press `a` in terminal

**Physical Device:**
- Install "Expo Go" from App Store / Play Store
- Scan QR code from terminal

---

## 📸 VIN Scanner (Coming Next)

To add camera functionality:

```bash
npm install expo-camera react-native-vision-camera
```

Then add VIN scanner screen (I can generate this for you).

---

## 🎨 Tesla Design System

### Colors
```typescript
teslaBlack: '#0A0A0F'       // Deep black background
teslaGray: '#1E1E24'         // Card background
teslaBlue: '#3E6AE1'         // Primary action
teslaGreen: '#00D563'        // Success
teslaRed: '#FF4757'          // Error
teslaYellow: '#FFB800'       // Warning
```

### Components
- `<GlassCard>` - Frosted blur card
- Haptic feedback on button press
- Spring animations
- Gradient borders

---

## 📂 Project Structure

```
MobileCarbCheck/
├── App.tsx                  # Entry point + navigation
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   └── GlassCard.tsx
│   └── theme/
│       └── colors.ts        # Tesla color palette
├── assets/                  # Icons, images
├── app.json                 # Expo config
└── package.json
```

---

## 🚀 Deploy to App Stores

### iOS (App Store)
```bash
# Build
eas build --platform ios

# Submit
eas submit --platform ios
```

### Android (Play Store)
```bash
# Build
eas build --platform android

# Submit
eas submit --platform android
```

**Cost:**
- Apple Developer: $99/year
- Google Play: $25 one-time

---

## 🔥 Next Steps

1. **Add VIN Scanner**
   - Camera component
   - OCR text recognition
   - Auto-detect 17-char VINs

2. **API Integration**
   - Gemini (VIN lookup, photo analysis)
   - Claude (report generation)
   - Twilio (SMS)

3. **Push Notifications**
   - Expo push notifications
   - Lead alerts, payment confirmations

4. **Offline Mode**
   - AsyncStorage for local data
   - Queue tests when offline
   - Sync when online

---

## 💡 Why React Native?

✅ **95% code reuse** - Write once, deploy twice
✅ **Fast development** - Hot reload, Expo tools
✅ **Same design** - Tesla UI works identically on iOS + Android
✅ **You know React** - Your web app already uses it
✅ **Huge community** - Any problem already solved

---

## 🆘 Troubleshooting

**Metro bundler won't start:**
```bash
npx expo start -c
```

**iOS Simulator not opening:**
```bash
sudo xcode-select --switch /Applications/Xcode.app
```

**Android Emulator not found:**
- Open Android Studio
- Tools → AVD Manager
- Create/Start emulator

**Dependencies error:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Ready to Add More?

**Tell me what you need:**
- VIN Scanner with camera
- API integration (Gemini, Claude)
- Photo capture for tests
- Report generation
- SMS sending

**I'll generate the code!** 🚀
