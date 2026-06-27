import type { AccessToken } from 'box-node-sdk/schemas';
import type { TokenStorage, CcgConfigInput, JwtConfigInput, OAuthConfigInput } from 'box-node-sdk/box';

import { isDef, isString, isObject, isFunction, getProperty } from '@whoj/utils-core';
import { BoxOAuth, CcgConfig, JwtConfig, BoxCcgAuth, BoxJwtAuth, OAuthConfig, BoxDeveloperTokenAuth } from 'box-node-sdk';

import type { BoxAuthType } from '#nuxt/box-sdk/types';

import { isTokenStorage } from '#nuxt/box-sdk/utils';
import { createError, useRuntimeConfig } from '#imports';

export type UseBoxAuthReturns<T extends BoxAuthType> = T extends 'dev'
  ? BoxDeveloperTokenAuth
  : T extends 'ccg'
    ? BoxCcgAuth
    : T extends 'jwt'
      ? BoxJwtAuth
      : BoxOAuth;

export type UseBoxAuthConfig<T extends BoxAuthType> = T extends 'dev'
  ? ConstructorParameters<typeof BoxDeveloperTokenAuth>[0]
  : T extends 'ccg'
    ? CcgConfig
    : T extends 'jwt'
      ? JwtConfig
      : OAuthConfig;

export type UseBoxAuthConfigInput<T extends BoxAuthType> = T extends 'dev'
  ? ConstructorParameters<typeof BoxDeveloperTokenAuth>[0]
  : T extends 'ccg'
    ? CcgConfigInput
    : T extends 'jwt'
      ? JwtConfigInput
      : OAuthConfigInput;

export interface BoxTokenStorageOptions {
  /**
   * if provided, will be used as storage prefix
   * @default `ccg` | 'jwt' | 'oauth' - depending on your configuration
   */
  auth?: string;

  /**
   * if provided, will be used to retrieve key for storing the access token
   * Otherwise, it will call NitroRuntimeHook named 'box:token:storageKey'
   */
  getKey?: () => string;
}
class BoxTokenStorage implements TokenStorage {
  #tokens = new Map<string, AccessToken>();

  constructor(
    protected readonly config: BoxTokenStorageOptions = {}
  ) {}

  clear() {
    const key = this.getKey();
    if (this.#tokens.has(key)) {
      this.#tokens.delete(key);
    }
    return Promise.resolve<undefined>(undefined);
  }

  get() {
    return Promise.resolve(this.#tokens.get(this.getKey()));
  }

  store(token: AccessToken) {
    this.#tokens.set(this.getKey(), token);
    return Promise.resolve<undefined>(undefined);
  }

  private getKey() {
    if (isFunction(this.config.getKey)) {
      return this.config.getKey();
    }

    return `${this.config.auth}:access_token`;
  }
}
export function useBoxAuth<T extends BoxAuthType>(authType?: T, config?: UseBoxAuthConfig<T> | UseBoxAuthConfigInput<T>, tokenStorage?: TokenStorage): undefined | UseBoxAuthReturns<T>;

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxCcgAuth(config?: CcgConfig | CcgConfigInput, tokenStorage?: TokenStorage) {
  return new BoxCcgAuth({ config: useBoxAuthConfig('ccg', config, tokenStorage) });
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxJwtAuth(config?: JwtConfig | JwtConfigInput, tokenStorage?: TokenStorage) {
  return new BoxJwtAuth({ config: useBoxAuthConfig('jwt', config, tokenStorage) });
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxOAuth(config?: OAuthConfig | OAuthConfigInput, tokenStorage?: TokenStorage) {
  return new BoxOAuth({ config: useBoxAuthConfig('oauth', config, tokenStorage) });
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxAuth<T extends BoxAuthType>(options?: { authType?: T; tokenStorage?: TokenStorage; config?: UseBoxAuthConfig<T> | UseBoxAuthConfigInput<T> }): undefined | UseBoxAuthReturns<T>;

export function useBoxAuth<T extends BoxAuthType>(...args: any[]): undefined | UseBoxAuthReturns<T> {
  let authType: T, tokenStorage: TokenStorage, _config: UseBoxAuthConfig<T> | UseBoxAuthConfigInput<T>;

  if (isObject<any>(args[0])) {
    authType = args[0].authType;
    _config = args[0].config;
    tokenStorage = args[0].tokenStorage;
  } else {
    [authType, _config, tokenStorage] = args;
  }

  authType ||= useRuntimeConfig().public.box.auth as T;

  const config = useBoxAuthConfig<T>(authType, _config, tokenStorage);

  if (!config) {
    return;
  }

  if (import.meta.dev && authType === 'dev') {
    return new BoxDeveloperTokenAuth(config as UseBoxAuthConfig<'dev'>) as UseBoxAuthReturns<T>;
  }

  if (authType === 'oauth') {
    return /* @__PURE__ */ useBoxOAuth(_config as UseBoxAuthConfig<'oauth'>) as UseBoxAuthReturns<T>;
  }

  if (authType === 'ccg') {
    return /* @__PURE__ */ useBoxCcgAuth(config as UseBoxAuthConfig<'ccg'>) as UseBoxAuthReturns<T>;
  }

  if (authType === 'jwt') {
    return /* @__PURE__ */ useBoxJwtAuth(config as UseBoxAuthConfig<'jwt'>) as UseBoxAuthReturns<T>;
  }
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxAuthConfig<T extends BoxAuthType>(auth?: T, config?: UseBoxAuthConfigInput<T>, tokenStorage?: TokenStorage): UseBoxAuthConfig<T> {
  const rc = useRuntimeConfig();
  if (!isDef(auth)) {
    if (rc.public.box?.auth) {
      auth = rc.public.box.auth as T;
    } else {
      throw createError({
        message: 'You must provide a valid box auth type!',
        name: 'InvalidBoxAuthTypeError'
      });
    }
  }

  if (!config) {
    if (import.meta.dev && auth === 'dev') {
      // @ts-ignore
      config = rc.public.box.developer;
    } else if (rc.box[auth]) { // @ts-ignore
      config = rc.box[auth];
    } else {
      throw createError({
        message: `You must provide a valid configuration for '${auth}' box auth!`,
        name: 'InvalidBoxAuthConfig'
      });
    }
  }

  if (auth !== 'dev' && !isTokenStorage(getProperty(config, 'tokenStorage'))) {
    config = Object.assign({}, config, {
      tokenStorage: tokenStorage ?? useBoxTokenStorage({ auth })
    });
  }

  if (import.meta.server) {
    if (auth === 'ccg') {
      return new CcgConfig(config as UseBoxAuthConfigInput<'ccg'>) as UseBoxAuthConfig<T>;
    }

    if (auth === 'jwt') {
      if ((config as any)?.configFile?.length) {
        return JwtConfig.fromConfigFile(
          (config as any).configFile,
          (config as any).tokenStorage
        ) as UseBoxAuthConfig<T>;
      }

      if ((config as any)?.configJson) {
        return JwtConfig.fromConfigJsonString(
          isString((config as any).configJson)
            ? (config as any).configJson
            : JSON.stringify((config as any).configJson),
          (config as any).tokenStorage
        ) as UseBoxAuthConfig<T>;
      }

      return new JwtConfig(config as UseBoxAuthConfigInput<'jwt'>) as UseBoxAuthConfig<T>;
    }
  }

  if (auth === 'oauth') {
    return new OAuthConfig(config as UseBoxAuthConfigInput<'oauth'>) as UseBoxAuthConfig<T>;
  }

  return config as UseBoxAuthConfig<T>;
}

function useBoxTokenStorage(options: BoxTokenStorageOptions = {}): TokenStorage {
  return new BoxTokenStorage(options);
}
