import type { MaybeRefOrGetter } from 'vue';
import type { Class } from '@whoj/utils-types';

import { hash } from 'ohash';
import { toValue, computed } from 'vue';
import { isString, isFunction } from '@whoj/utils-core';

import type { KeysOf, PickFrom } from '#app/composables/asyncData';
import type { NuxtApp, AsyncData, NuxtError, AsyncDataOptions } from '#app';

import { createError, useAsyncData } from '#imports';
import { createBoxManager as managerFactory } from '#nuxt/box-sdk/utils';

// export const useBoxAsyncData: typeof useAsyncData = createDataFn(useAsyncData);
//
// export const useLazyBoxAsyncData: typeof useAsyncData = createDataFn(useLazyAsyncData);

type MaybeRefOrGetterArgs<T extends unknown[]> = T extends infer LNT ? {
  [L in keyof LNT]: MaybeRefOrGetter<T[L]>;
} : never;
// type Mutable<T> = {
//   -readonly [P in keyof T]: T[P];
// };
//
// export type ManagerApi<T extends InstanceType<Class<any>>> = Exclude<keyof T, 'auth' | 'networkSession'>;
// export type ManagerApiReturns<T extends Class<any>, A extends ManagerApi<InstanceType<T>> = ManagerApi<InstanceType<T>>> = Mutable<Awaited<ReturnType<InstanceType<T>[A]>>>;
//
type KeysToExclude = 'auth' | 'withProxy' | 'networkSession' | 'withAsUserHeader' | 'withExtraHeaders' | 'withInterceptors' | 'withCustomBaseUrls' | 'withCustomAgentOptions' | 'withSuppressedNotifications';
type WithAsyncData<T extends Class<any>> = Class<Pick<T['prototype'], Extract<keyof T['prototype'], KeysToExclude>> & {
  [P in Exclude<keyof T['prototype'], KeysToExclude>]:
  T['prototype'][P] extends ((...args: infer A) => Promise<infer R>)
    ? ((...args: MaybeRefOrGetterArgs<A>) => AsyncData<R, NuxtError>)
    : T['prototype'][P];
}>;
type UseManagerMethodData<T extends Class<any>> = {
  [P in Exclude<keyof T['prototype'], KeysToExclude> as P extends string ? `${P}AsyncData` : never]:
  T['prototype'][P] extends ((...args: infer A) => Promise<infer R>)
    ? ((opts: AsyncDataOptions<R>, ...args: MaybeRefOrGetterArgs<A>) => AsyncData<R, NuxtError>)
    : T['prototype'][P];
};

export function createBoxManager<T extends Class<any>>(...args: Parameters<typeof managerFactory<T>>) {
  const [manager, auth, networkSession] = args;

  const Manager = class extends manager {
    _useAsyncData<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = DataT>(key: string, handler: ((nuxt?: NuxtApp) => Promise<ResT>), opts?: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>): AsyncData<DefaultT | PickFrom<DataT, PickKeys>, NuxtError> {
      let controller: AbortController;
      // @ts-ignore
      return useAsyncData(
        key,
        async (nuxt) => {
          controller?.abort?.();

          if (nuxt && nuxt.isHydrating && nuxt.payload.data[key]) {
            return nuxt.payload.data[key];
          }

          controller = new AbortController();
          const _target = this.withInterceptors([
            {
              afterRequest: (response: any) => response,
              beforeRequest(options: any) {
                return { ...options, cancellationToken: controller.signal };
              }
            }
          ]);

          try {
            let result = await handler.call(this, nuxt);
            result = JSON.parse(JSON.stringify(result));

            if (nuxt) {
              nuxt.payload.data[key] = result;
            }

            return result;
          } catch (error: any) {
            if (nuxt) {
              nuxt.payload.data[key] = undefined;
            }

            throw createError(error);
          }
        },
        {
          ...((opts || {}) as any),
          watch: [
            ...(opts?.watch || []),
            () => toValue(args)
          ]
        }
      );
    }

    useAsyncData<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = DataT>(handler: (manager: InstanceType<typeof Manager>, nuxtApp?: NuxtApp) => Promise<ResT>, options?: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>): AsyncData<DefaultT | PickFrom<DataT, PickKeys>, NuxtError>;
    useAsyncData<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = DataT>(key: string, handler: (manager: InstanceType<typeof Manager>, nuxtApp?: NuxtApp) => Promise<ResT>, options?: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>): AsyncData<DefaultT | PickFrom<DataT, PickKeys>, NuxtError>;
    useAsyncData<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = DataT>(...args: any[]): AsyncData<DefaultT | PickFrom<DataT, PickKeys>, NuxtError> {
      if (isString(args[0])) {
        args.unshift(`box:${manager.name}:${hash(args)}`);
      }

      const [key, handler, opts] = args as [string, ((manager: InstanceType<typeof Manager>, nuxtApp?: NuxtApp) => Promise<ResT>), AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>];

      return this._useAsyncData(key, nuxt => handler(this, nuxt), opts);
    }

    useLazyAsyncData<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = DataT>(handler: (manager: InstanceType<typeof Manager>, nuxtApp?: NuxtApp) => Promise<ResT>, options?: Omit<AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>, 'lazy'>): AsyncData<DefaultT | PickFrom<DataT, PickKeys>, NuxtError>;
    useLazyAsyncData<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = DataT>(key: string, handler: (manager: InstanceType<typeof Manager>, nuxtApp?: NuxtApp) => Promise<ResT>, options?: Omit<AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>, 'lazy'>): AsyncData<DefaultT | PickFrom<DataT, PickKeys>, NuxtError>;
    useLazyAsyncData<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = DataT>(...args: any[]): AsyncData<DefaultT | PickFrom<DataT, PickKeys>, NuxtError> {
      if (isString(args[0])) {
        args.unshift(`box:${manager.name}:${hash(args)}`);
      }

      const [key, handler, opts] = args as [string, ((manager: InstanceType<typeof Manager>, nuxtApp?: NuxtApp) => Promise<ResT>), Omit<AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>, 'lazy'>];

      return this._useAsyncData(key, nuxt => handler(this, nuxt), { ...opts, lazy: true });
    }

    withAsyncData(opts: AsyncDataOptions<any> = {}) {
      return new Proxy(this, {
        get(target, prop: string) {
          if (
            target[prop]
            && isFunction(target[prop])
            && !/with(?:AsUserHeader|SuppressedNotifications|ExtraHeaders|CustomBaseUrls|Proxy|CustomAgentOptions|Interceptors)/.test(<string>prop)
          ) {
            return (...args: MaybeRefOrGetter[]) => {
              if (args.length > target[prop].length) {
                opts = args.pop();
              }

              const _key = computed(() => {
                return `box:${manager.name}:${hash([prop, ...(args.map(a => toValue(a)))])}`;
              });

              return target._useAsyncData(
                _key.value,
                // @ts-ignore
                // eslint-disable-next-line no-useless-call
                () => target[prop].call(target, ...args.map(a => toValue(a))),
                {
                  ...((opts || {}) as any),
                  watch: [
                    ...(opts?.watch || []),
                    () => toValue(args)
                  ]
                }
              );
            };
          }

          return Reflect.get(target, prop);
        }
      }) as unknown as InstanceType<WithAsyncData<T>>;
    }
  };

  return managerFactory(Manager, auth, networkSession);
}

// const g = createBoxManager(UsersManager).withAsyncData().getUserMe()
