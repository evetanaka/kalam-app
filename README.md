# kalam

> Vos messages n'existent que sur vos téléphones.

Messagerie chiffrée de bout en bout, décentralisée, sans serveur central. Impossible à éteindre.

## Architecture

```
kalam/
├── apps/
│   ├── mobile/          # React Native (Expo SDK 52)
│   └── web/             # React (Vite 6 + react-native-web)
├── packages/
│   ├── theme/           # Design tokens, ThemeProvider
│   ├── ui/              # Shared component library
│   ├── stores/          # Zustand state management
│   ├── i18n/            # Internationalization (FR, EN)
│   └── core-rust/       # Rust core (OpenMLS, Waku, crypto)
├── turbo.json
└── pnpm-workspace.yaml
```

## Stack

- **Mobile:** React Native + Expo SDK 52
- **Web:** Vite 6 + react-native-web
- **Core:** Rust (uniffi mobile, WASM web)
- **State:** Zustand v5
- **Crypto:** X3DH + Double Ratchet (1:1), MLS RFC 9420 (groups)
- **Transport:** Waku v2 (P2P)
- **Chain:** Ethereum mainnet (ERC-4337, $KLM)

## Development

```bash
# Install dependencies
pnpm install

# Start mobile
pnpm dev:mobile

# Start web
pnpm dev:web

# Build all
pnpm build

# Lint + typecheck
pnpm lint && pnpm typecheck
```

## Design System

- **Fonts:** Bricolage Grotesque (display), Inter (body), JetBrains Mono (technical)
- **Colors:** Green (#1DAB61), Deep (#0B5C3B), Yellow (#F5C518 — value only)
- **Dark mode:** Immersive green night (#0E2A1F)

## License

Proprietary — Ikigai Intl © 2026
