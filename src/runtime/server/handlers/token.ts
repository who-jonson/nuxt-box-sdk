import type { BoxAuthType } from '#nuxt/box-sdk/types';

import { eventHandler, useRuntimeConfig, appendResponseHeader } from '#imports';

export default eventHandler(async (event) => {
  try {
    const { auth, routes } = useRuntimeConfig(event).public.box;
    const authType = ((routes.token && routes.token.authType) || auth) as Exclude<BoxAuthType, 'dev'>;

    const boxAuth = (await import('./../utils/auth')).useBoxAuth(authType)!;
    const token = await (
      event.method === 'POST'
        ? boxAuth.refreshToken()
        : boxAuth.retrieveToken()
    );

    appendResponseHeader(event, 'content-type', 'application/json');

    return {
      accessToken: token.accessToken,
      expiresIn: token.expiresIn
    };
  } catch (err: any) {
    throw (await import('./_')).createBoxSdkError(err);
  }
});
