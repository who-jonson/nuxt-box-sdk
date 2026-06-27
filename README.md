# nuxt-box-sdk

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Box TypeScript SDK integration for Nuxt — tree-shaken managers, SSR-ready, proxy mode, and multiple auth strategies.

- [Release Notes](/CHANGELOG.md)
- [📖 Documentation](https://docs.whoj.dev/nuxt-box-sdk)

## Features

- **Tree-shaken managers** — bundle only the Box managers you need via `managers.include`. No 50+ manager overhead in your final build.
- **SSR-ready** — first-class integration with Nuxt's Nitro server engine; no extra configuration required.
- **Proxy mode** — server auto-injects Box access tokens and proxies API calls through `/_box/proxy`. Credentials never reach the browser.
- **Multiple auth strategies** — developer token (local dev), CCG, JWT, and OAuth all supported out of the box.
- **Auto-imported composables** — `useBoxFilesManager()`, `useBoxFoldersManager()`, and every other manager composable are fully typed and auto-imported.
- **Full TypeScript** — built on the official `box-node-sdk` with complete type safety end-to-end.

## Quick Start

### 1. Install

```bash
# pnpm
pnpm add nuxt-box-sdk

# npm
npm install nuxt-box-sdk

# Or via nuxi
npx nuxi module add nuxt-box-sdk
```

### 2. Register the module

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-box-sdk'],

  boxSdk: {
    // Developer token for local development only
    developer: {
      token: process.env.BOX_DEVELOPER_TOKEN
    },

    // Only bundle the managers you actually use
    managers: {
      include: ['files', 'folders', 'search']
    }
  }
})
```

### 3. Use a composable

```vue
<script setup lang="ts">
const files = useBoxFilesManager()

const { data } = await files.withAsyncData().getItems('0')
</script>
```

## Configuration

Full reference is available at [docs.whoj.dev/nuxt-box-sdk](https://docs.whoj.dev/nuxt-box-sdk). The most commonly used options are:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `developer.token` | `string` | — | Box developer token. Active in development mode only. |
| `ccg` | `CcgConfigInput` | — | Client Credentials Grant auth config for server-to-server use. |
| `jwt` | `JwtConfigInput` | — | JWT auth config for enterprise applications. |
| `oauth` | `OAuthConfigInput` | — | OAuth config for end-user login flows. |
| `managers.include` | `string[]` | (all) | Allowlist of manager names to bundle (e.g. `['files', 'folders']`). |
| `managers.exclude` | `string[]` | `[]` | Blocklist of manager names to strip from the bundle. |
| `proxy` | `string \| false` | `'/_box/proxy'` | Path for the server-side proxy, or `false` to disable. |
| `ssr` | `boolean` | `true` | Enable SSR integration with Nitro. |
| `tokenStorage` | `string` | `'cache'` | Nitro unstorage mount used for OAuth token persistence. |
| `mode` | `'auto' \| 'client' \| 'server'` | `'auto'` | Controls whether client composables, server utilities, or both are registered. |

## Auth Strategies

### Developer Token (local dev only)

Set the token via env var or directly in `nuxt.config.ts`. This strategy is disabled automatically in production.

```bash
BOX_DEVELOPER_TOKEN=your_token_here
# or
NUXT_PUBLIC_BOX_DEVELOPER_TOKEN=your_token_here
```

### CCG — Client Credentials Grant

Suitable for server-to-server integrations with a service account.

```bash
NUXT_BOX_CCG_CLIENT_ID=...
NUXT_BOX_CCG_CLIENT_SECRET=...
NUXT_BOX_CCG_ENTERPRISE_ID=...   # or BOX_CCG_USER_ID for user tokens
```

```ts
// nuxt.config.ts
boxSdk: {
  ccg: {
    clientId: process.env.NUXT_BOX_CCG_CLIENT_ID,
    clientSecret: process.env.NUXT_BOX_CCG_CLIENT_SECRET,
    enterpriseId: process.env.NUXT_BOX_CCG_ENTERPRISE_ID
  }
}
```

### JWT

For enterprise applications using a Box JWT application config.

```bash
NUXT_BOX_JWT_CLIENT_ID=...
NUXT_BOX_JWT_CLIENT_SECRET=...
NUXT_BOX_JWT_ENTERPRISE_ID=...
NUXT_BOX_JWT_JWT_KEY_ID=...
NUXT_BOX_JWT_PRIVATE_KEY=...
NUXT_BOX_JWT_PRIVATE_KEY_PASSPHRASE=...
```

### OAuth

For end-user login. The module automatically registers `GET /_box/authenticate` and `GET /_box/authenticate/callback` routes.

```bash
NUXT_BOX_OAUTH_CLIENT_ID=...
NUXT_BOX_OAUTH_CLIENT_SECRET=...
```

## Tree-Shaking

By default, the module generates composables for all Box SDK managers (~50+). Use `managers.include` to limit the bundle to only what your app uses:

```ts
// nuxt.config.ts
boxSdk: {
  managers: {
    // Only these managers will be generated and bundled
    include: ['files', 'folders', 'search', 'shared-links-files']
  }
}
```

Use `managers.exclude` when you want most managers but need to drop a few:

```ts
boxSdk: {
  managers: {
    exclude: ['ai', 'sign-requests', 'events']
  }
}
```

Manager names correspond to the `box-node-sdk` manager identifiers (e.g. `files` → `useBoxFilesManager`, `folders` → `useBoxFoldersManager`).

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs and prepare the module
pnpm dev:prepare

# Start the playground dev server
pnpm dev

# Build the playground
pnpm dev:build

# Lint
pnpm lint
pnpm lint:fix

# Run tests (Vitest e2e via @nuxt/test-utils)
pnpm test
pnpm test:watch

# Type check
pnpm test:types

# Build the module for publishing
pnpm prepack
```

## License

[MIT](./LICENSE) — Copyright (c) who-jonson

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-box-sdk?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-box-sdk

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-box-sdk?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-box-sdk

[license-src]: https://img.shields.io/npm/l/nuxt-box-sdk?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-box-sdk

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
