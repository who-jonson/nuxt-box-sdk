import { defineEventHandler, appendResponseHeader } from 'h3';

import type { BoxAuthType } from '#nuxt/box-sdk/types';

import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const { auth, routes } = useRuntimeConfig(event).public.box; // @ts-ignore
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
