import type { Storage } from 'unstorage';
import type { TokenStorage } from 'box-node-sdk/box';
import type { AccessToken } from 'box-node-sdk/schemas';

import { prefixStorage } from 'unstorage';
import { isString, isFunction } from '@whoj/utils-core';

import { useStorage, useNitroApp, useRuntimeConfig } from '#imports';

export interface BoxTokenStorageData extends AccessToken {

}

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
  getKey?: () => string | Promise<string>;
}

class BoxTokenStorage implements TokenStorage {
  constructor(
    readonly storage: Storage<BoxTokenStorageData>,
    protected readonly config: BoxTokenStorageOptions = {}
  ) {}

  async clear() {
    await this.storage.clear(await this.getKey());
    return undefined;
  }

  async get() {
    const key = await this.getKey();
    const data = (await this.storage.getItem(key)) ?? undefined;
    if (!data)
      return undefined;
    return {
      ...data,
      key,
      meta: await this.storage.getMeta(key)
    };
  }

  async store(token: AccessToken) {
    await this.storage.setItem(await this.getKey(), token);
    return undefined;
  }

  private async getKey() {
    if (isFunction(this.config.getKey)) {
      return this.config.getKey();
    }

    const obj = {
      auth: this.config.auth,
      key: 'access_token'
    };

    // @ts-ignore
    await useNitroApp().hooks.callHook('box:token:storageKey', obj);

    return obj.key;
  }
}

export function useBoxTokenStorage(storage: string | Storage = 'cache', options: BoxTokenStorageOptions = {}): TokenStorage {
  const unstorage = !storage || isString(storage)
    ? useStorage(storage ?? 'cache')
    : storage;

  let base = 'box';
  options.auth ||= useRuntimeConfig().public.box.auth;
  if (options.auth?.length) {
    base += `:${options.auth}`;
  }

  const boxStorage = prefixStorage<BoxTokenStorageData>(unstorage, base);

  return new BoxTokenStorage(boxStorage, options);
}
