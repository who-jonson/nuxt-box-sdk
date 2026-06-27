import { withBase } from 'ufo';

import { useNitroApp, sendRedirect, getRequestURL, useRuntimeConfig, defineEventHandler } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const boxAuth = (await import('./../utils/auth')).useBoxOAuth();

    const options = {
      redirectUri: withBase(useRuntimeConfig().public.box.routes?.redirect.path, getRequestURL(event).origin)
    };

    // @ts-ignore
    await useNitroApp().hooks.callHook('box:login:before', { event, options });

    return sendRedirect(event, boxAuth.getAuthorizeUrl(options));
  } catch (err) {
    throw (await import('./_')).createBoxSdkError(err);
  }
});
