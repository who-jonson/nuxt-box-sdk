import { getQuery, useNitroApp, defineEventHandler } from '#imports';

export default defineEventHandler<{
  query: {
    code: string;
  };
}>(async (event) => {
  try {
    const boxAuth = (await import('./../utils/auth')).useBoxOAuth()!;

    const response = await boxAuth.getTokensAuthorizationCodeGrant(
      getQuery(event).code
    );

    // @ts-ignore
    await useNitroApp().hooks.callHook('box:login:success', { event, response });
  } catch (e) {
    throw (await import('./_')).createBoxSdkError(e);
  }
});
