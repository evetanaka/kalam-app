# Kalam

**Messagerie chiffrée, sans serveur, récupérable.**

Vos messages n'existent que sur vos téléphones. Chiffré de bout en bout via le protocole MLS, sans serveur central, avec récupération sociale par gardiens.

## Structure du monorepo

```
kalam-app/
├── apps/
│   ├── mobile/          # React Native (Expo SDK 52)
│   └── web/             # React (Vite 6 + react-native-web)
├── packages/
│   ├── theme/           # Design tokens, couleurs, typographie
│   ├── ui/              # Composants partagés (mobile + web)
│   ├── stores/          # État global (Zustand v5)
│   └── i18n/            # Internationalisation (i18next, FR + EN)
├── turbo.json           # Turborepo config
├── pnpm-workspace.yaml  # pnpm workspaces
└── tsconfig.base.json   # TypeScript config partagée
```

## Commandes de développement

```bash
# Installer les dépendances
pnpm install

# Lancer l'app mobile (Expo)
pnpm --filter @kalam/mobile dev

# Lancer l'app web (Vite)
pnpm --filter @kalam/web dev

# Typecheck tout le monorepo
pnpm turbo typecheck

# Lint tout le monorepo
pnpm turbo lint

# Build web
pnpm --filter @kalam/web build

# Build mobile (iOS)
pnpm --filter @kalam/mobile build:ios

# Build mobile (Android)
pnpm --filter @kalam/mobile build:android
```

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Mobile | React Native + Expo SDK 52, Expo Router |
| Web | React 18 + Vite 6 + react-native-web |
| Navigation | Expo Router (mobile), React Router v7 (web) |
| État | Zustand v5 avec persist (MMKV mobile / localStorage web) |
| i18n | i18next + react-i18next (FR, EN) |
| Chiffrement | MLS (futur core Rust → WASM) |
| Blockchain | ERC-4337 smart accounts, $KLM token |
| Monorepo | Turborepo + pnpm workspaces |

## Design tokens

- Police UI : **Inter** (400, 500, 600)
- Police display : **Bricolage Grotesque** (600, 700, 800)
- Police technique : **JetBrains Mono** (400, 500)
- Couleur primaire : `#1DAB61` (green)
- Couleur deep : `#0B5C3B`
- Couleur valeur : `#F5C518` (yellow)

## Licence

Propriétaire — © 2026 Ikigai
