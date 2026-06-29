import { defineNitroPlugin } from 'nitropack/runtime';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    const { useBoxTokenStorage } = await import('./../utils/storage');
    event.context.$box = {
      resolveTokenStorage: (auth?: 'ccg' | 'jwt' | 'oauth') => useBoxTokenStorage('cache', { auth })
    };
  });
});
