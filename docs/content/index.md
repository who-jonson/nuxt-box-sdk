---
title: "nuxt-box-sdk — Box SDK for Nuxt"
description: Integrate Box into your Nuxt application with tree-shaken managers, SSR support, proxy mode, and multiple auth strategies.
navigation: false
---

::u-page-hero
---
title: Box SDK for Nuxt
description: Integrate Box into your Nuxt application with tree-shaken managers, SSR-ready auth, and a secure proxy mode that keeps credentials server-side.
---

#links
  :::u-button
  ---
  to: /getting-started/introduction
  size: xl
  ---
  Get Started
  :::

  :::u-button
  ---
  to: https://github.com/who-jonson/nuxt-box-sdk
  target: _blank
  color: neutral
  variant: outline
  size: xl
  ---
  GitHub
  :::
::

::u-page-section
---
title: Why nuxt-box-sdk?
description: Everything you need to work with Box in a Nuxt application — without the overhead.
---

  :::u-page-feature
  ---
  title: Tree-Shaken Managers
  icon: i-lucide-scissors
  ---
  Bundle only the Box managers you actually use. A standard `box-node-sdk` import includes 50+ managers. With `managers.include: ['files', 'folders']`, you ship only what your app needs.
  :::

  :::u-page-feature
  ---
  title: SSR-Ready
  icon: i-lucide-server
  ---
  Works seamlessly with Nuxt's Nitro server engine. Server-side auth, token storage via unstorage, and composables that behave correctly in both SSR and client-side contexts.
  :::

  :::u-page-feature
  ---
  title: Proxy Mode
  icon: i-lucide-shield
  ---
  The server intercepts Box API calls, injects access tokens, and forwards the request. Box credentials never reach the browser — your tokens stay server-side by design.
  :::

  :::u-page-feature
  ---
  title: Multiple Auth Strategies
  icon: i-lucide-key-round
  ---
  Developer token for local dev, CCG for service accounts, JWT for enterprise apps, and OAuth for end-user authentication. Switch between them with a single config key.
  :::

  :::u-page-feature
  ---
  title: Type-Safe
  icon: i-lucide-code-2
  ---
  Built on `box-node-sdk` with full TypeScript support. Composables and the `BoxClient` class are generated at build time, giving you accurate types for every included manager.
  :::
::
