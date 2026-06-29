import { isObject } from '@whoj/utils-core/is';
import { createResolver, addServerPlugin, defineNuxtModule, addServerHandler } from '@nuxt/kit';

import type { ModuleOptions } from './types';

import { registerImports } from './_/client';
import { configureSdkOptions } from './_/config';
import { name, version } from './../package.json';
import { registerTypeTemplates } from './_/templates';

const configKey = 'box' as const;

export default defineNuxtModule<ModuleOptions>().with({
  defaults: ({ options }) => ({
    debug: options.debug,
    managers: {
      composables: true
    },
    mode: 'auto',
    proxy: options.ssr ? '/_box/proxy' as const : false,
    routes: {
      login: {
        method: 'get' as const,
        path: '/_box/authenticate' as const
      },
      redirect: {
        method: 'get' as const,
        path: '/_box/authenticate/callback' as const
      }
    }
  } as ModuleOptions),
  meta: {
    compatibility: {
      nuxt: '>=3.14'
    },
    configKey,
    name,
    version
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    nuxt.options.build.transpile.push(resolve('./runtime/'));

    configureSdkOptions(options, nuxt);

    nuxt.options.alias['#nuxt/box-sdk/types'] = resolve('./runtime/shared/types');
    nuxt.options.alias['#nuxt/box-sdk/utils'] = resolve('./runtime/shared/utils');

    registerImports(resolve, options, nuxt);
    registerTypeTemplates(!!(nuxt.options.ssr && options.mode !== 'client' && options.proxy));

    if (nuxt.options.ssr && options.mode !== 'client') {
      if (isObject<Exclude<ModuleOptions['routes'], false | undefined>>(options.routes)) {
        if (isObject<Exclude<Exclude<ModuleOptions['routes'], false | undefined>['login'], false | undefined>>(options.routes.login)) {
          addServerHandler({
            handler: resolve('./runtime/server/handlers/login'),
            method: options.routes.login.method,
            route: options.routes.login.path
          });
        }

        if (isObject<Exclude<Exclude<ModuleOptions['routes'], false | undefined>['redirect'], false | undefined>>(options.routes.redirect)) {
          addServerHandler({
            handler: resolve('./runtime/server/handlers/redirect'),
            method: options.routes.redirect.method,
            route: options.routes.redirect.path
          });
        }
      }

      if (options.proxy) {
        addServerHandler({
          handler: resolve('./runtime/server/handlers/proxy'),
          middleware: true
        });

        addServerPlugin(resolve('./runtime/server/plugins/box'));
      }
    }
  }
});

export type { ModuleOptions, ModuleRuntimeConfig, ModulePublicRuntimeConfig } from './types';
