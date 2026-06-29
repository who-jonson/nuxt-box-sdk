import { defu } from 'defu';
import { useNuxt, updateRuntimeConfig } from '@nuxt/kit';
import { isString, deleteProperty } from '@whoj/utils-core';

import type { ModuleOptions, ModuleRuntimeConfig, ModulePublicRuntimeConfig } from '../types';

export function configureSdkOptions(options: ModuleOptions, nuxt = useNuxt()) {
  const isDev = !!(nuxt.options.dev || nuxt.options._prepare);

  let runtimeConfig: ModuleRuntimeConfig['box'] = {};

  if (options.ccg || options.auth === 'ccg') {
    runtimeConfig.ccg = {
      clientId: '',
      clientSecret: '',
      enterpriseId: '',
      userId: '',
      ...(options.ccg || {})
    };
  }

  if (options.jwt || options.auth === 'jwt') { // @ts-ignore
    runtimeConfig.jwt = {
      algorithm: undefined,
      clientId: '',
      clientSecret: '',
      configFile: '',
      configJson: '',
      enterpriseId: '',
      jwtKeyId: '',
      privateKey: '',
      privateKeyPassphrase: '',
      userId: '',
      ...(options.jwt || {})
    };
  }

  if (options.oauth || options.auth === 'oauth') {
    runtimeConfig.oauth = {
      clientId: '',
      clientSecret: '',
      ...(options.oauth || {})
    };
  }

  runtimeConfig = defu((nuxt.options.runtimeConfig.box || {}), runtimeConfig);

  const publicRuntimeConfig = defu(
    (nuxt.options.runtimeConfig.public.box || {}),
    { // @ts-ignore
      auth: options.auth ?? '',
      ...(isDev ? { debug: options.debug, developer: { token: '' } } : {}),
      routes: options.routes ? options.routes : undefined
    } satisfies ModulePublicRuntimeConfig['box']
  );

  if (nuxt.options.ssr && options.mode !== 'client' && options.proxy !== false) {
    publicRuntimeConfig.proxy = isString(options.proxy) ? options.proxy : '/_box/proxy';
  }

  if (import.meta.dev) {
    const developerToken = process.env.BOX_DEVELOPER_TOKEN
      || process.env.NUXT_PUBLIC_BOX_DEVELOPER_TOKEN
      || process.env.NUXT_BOX_DEVELOPER_TOKEN;
    if (isString(developerToken)) {
      publicRuntimeConfig.developer.token = developerToken;
    }

    if (!options.auth && publicRuntimeConfig.developer.token) {
      publicRuntimeConfig.auth = 'dev';
    }
  } else if (publicRuntimeConfig.developer) {
    deleteProperty(publicRuntimeConfig, 'developer');
  }

  updateRuntimeConfig({
    box: runtimeConfig,
    public: {
      box: publicRuntimeConfig
    }
  });
}
