# kalam

End-to-end encrypted, decentralized messaging.

## Stack

- **React Native** + **Expo** (TypeScript)
- **Expo Router** for file-based navigation
- **EAS Build** for iOS & Android builds

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Build

```bash
npx eas build --platform ios
npx eas build --platform android
```

## Project Structure

```
app/              # Expo Router screens (file-based routing)
src/
  components/     # Reusable UI components
  screens/        # Complex screen logic
  lib/            # Crypto, networking, storage
  theme/          # Colors, typography, spacing
  types/          # TypeScript type definitions
assets/           # Icons, fonts, images
```

## License

MIT
