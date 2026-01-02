# Astrovigya - Astrologer

A comprehensive React Native application for astrologers to manage consultations, chat with clients, and provide astrological services.

## Overview

Astrovigya Astrologer is a mobile application designed specifically for professional astrologers to:
- Manage client consultations and appointments
- Conduct live chat sessions with clients
- Handle video/audio calls for consultations
- Track earnings and manage withdrawals
- Upload session summaries and reports
- Manage availability and services

## Features

### 🔐 Authentication & Profile Management
- Secure login and registration
- OTP verification
- Password recovery
- Personal information management
- Profile customization

### 💬 Communication
- Real-time chat with clients
- File sharing in chat
- Video/audio calling integration
- Chat history management

### 📅 Consultation Management
- Availability scheduling
- Service management
- Client management
- Session summaries

### 💰 Financial Management
- Earnings tracking
- Withdrawal requests
- Bank details management
- Order summaries

### 📱 Additional Features
- Push notifications
- Multi-language support (English/Hindi)
- Offline support
- Customer support integration
- Privacy policy and terms

## Tech Stack

- **Framework**: React Native 0.80.1
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 7.x
- **Backend**: Firebase (Firestore, Analytics, Messaging, Storage)
- **Real-time Communication**: Agora SDK
- **UI Components**: React Native Material Core
- **Internationalization**: i18next
- **Payment**: Razorpay integration

## Prerequisites

Before running this project, ensure you have:

- Node.js (>= 18.0.0)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- Firebase project setup
- Agora.io account for video/audio features

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AstrovigyaAstrologer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS dependencies (iOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Apply patches**
   ```bash
   npx patch-package
   ```

5. **Link assets**
   ```bash
   npx react-native-asset
   ```

## Configuration

### Firebase Setup
1. Add your `google-services.json` file to `android/app/`
2. Add your `GoogleService-Info.plist` file to `ios/AstrovigyaAstrologer/`
3. Configure Firebase in your project

### Environment Variables
Create a `.env` file in the root directory and add:
```env
# Add your environment variables here
AGORA_APP_ID=your_agora_app_id
RAZORPAY_KEY=your_razorpay_key
# Add other required environment variables
```

## Running the Application

### Start Metro Server
```bash
npm start
# or
yarn start
```

### Run on Android
```bash
npm run android
# or
yarn android
```

### Run on iOS
```bash
npm run ios
# or
yarn ios
```

## Build Commands

### Android
```bash
# Clean build
npm run clean

# Debug build
cd android && ./gradlew assembleDebug

# Release build
cd android && ./gradlew assembleRelease
```

### iOS
```bash
# Build from Xcode or
npx react-native run-ios --configuration Release
```

## Project Structure

```
src/
├── assets/           # Images, fonts, and static assets
├── components/       # Reusable UI components
├── context/          # React context providers
├── Languages/        # Internationalization files
├── model/           # Data models and types
├── navigation/      # Navigation configuration
├── screens/         # Screen components
│   ├── AuthScreen/  # Authentication related screens
│   └── NoAuthScreen/ # Main app screens
├── store/           # Redux store and slices
└── utils/           # Utility functions and helpers
```

## Key Dependencies

- **@react-native-firebase/**: Firebase integration
- **agora-rn-uikit**: Video/audio calling
- **react-native-gifted-chat**: Chat functionality
- **@reduxjs/toolkit**: State management
- **react-i18next**: Internationalization
- **react-native-razorpay**: Payment processing
- **react-native-calendars**: Calendar functionality

## Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run clean` - Clean Android build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

3. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

4. **Package conflicts**
   ```bash
   rm -rf node_modules
   npm install
   npx patch-package
   ```

## License

This project is private and proprietary. All rights reserved.

## Support

For support and queries, please contact the development team or refer to the in-app customer support feature.

---

**Version**: 0.0.11  
**React Native**: 0.80.1  
**Node**: >=18.0.0
