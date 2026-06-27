import { sendRedirect } from '#imports';

export default defineNitroPlugin((nitro) => { // @ts-ignore
  nitro.hooks.hook('box:login:before', ({ options }) => {
    console.log(options);
  });
  // @ts-ignore
  nitro.hooks.hook('box:login:success', async ({ event }) => {
    await sendRedirect(event, '/');
  });
});
