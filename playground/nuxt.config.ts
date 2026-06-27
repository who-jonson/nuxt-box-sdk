export default defineNuxtConfig({

  modules: ['nuxt-box-sdk'],

  devtools: { enabled: true },

  experimental: {
    browserDevtoolsTiming: true,
    typedPages: true
  },

  compatibilityDate: 'latest',

  vite: {
    define: {
      __DEV__: JSON.stringify(true)
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@whoj/utils-core',
        'box-node-sdk',
        'box-node-sdk/box/errors',
        'box-node-sdk/box/tokenStorage',
        'box-node-sdk/managers/chunkedUploads',
        'box-node-sdk/managers/downloads',
        'box-node-sdk/managers/files',
        'box-node-sdk/managers/folders',
        'box-node-sdk/managers/search',
        'box-node-sdk/managers/uploads',
        'box-node-sdk/managers/users',
        'box-node-sdk/managers/zipDownloads',
        'box-node-sdk/networking'
      ]
    }
  },

  // runtimeConfig: {
  //   box: {
  //
  //   }
  // },

  telemetry: {
    enabled: false
  },
  box: {
    auth: 'jwt',
    managers: {
      exclude: [],
      include: ['files', 'folders', 'search', 'chunkedUploads', 'uploads', 'downloads', 'users', 'zipDownloads']
    }
  }
});
