import type { TokenStorage } from 'box-node-sdk/box';
import type { AccessToken } from 'box-node-sdk/schemas';
import type { AgentOptions } from 'box-node-sdk/internal';
import type { ProxyConfig, Interceptor, BaseUrlsInput, Authentication } from 'box-node-sdk/networking';

import { BaseUrls, NetworkSession } from 'box-node-sdk/networking';
import { isObject, objectMap, isFunction, ensureSuffix, hasOwnProperty } from '@whoj/utils-core';

import type { BoxManager, BoxManagerClass, BoxManagerNetworkSession } from '#nuxt/box-sdk/types';

import { useBoxAuth, useRuntimeConfig } from '#imports';

/**
 * @__NO_SIDE_EFFECTS__
 */
export function isAccessToken<T extends AccessToken>(value: unknown): value is T {
  return isObject<T>(value) && hasOwnProperty(value, 'accessToken');
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function invokeCachedFunction<T extends ((...args: unknown[]) => any)>(fn: T, ...args: Parameters<T>): ReturnType<T> {
  return createCachedFunction(fn)(...args);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function isAuthentication<T extends Authentication>(value: unknown): value is T {
  return isObject<T>(value)
    && isFunction(value.retrieveToken)
    && isFunction(value.refreshToken);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function isTokenStorage<T extends TokenStorage>(value: unknown): value is T {
  return isObject<T>(value)
    && isFunction(value.get)
    && isFunction(value.clear)
    && isFunction(value.store);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function createCachedFunction<T extends ((...args: any[]) => any)>(fn: T): T {
  const cache = /* @__PURE__ */ new Map<string, ReturnType<T>>();

  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const cacheKey = JSON.stringify(args);
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }

      const result = Reflect.apply(target, thisArg, args);
      cache.set(cacheKey, result);
      return result;
    }
  });
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export const createBoxManager: typeof boxManagerFactory = /* @__PURE__ */ createCachedFunction(boxManagerFactory);

/**
 * @__NO_SIDE_EFFECTS__
 */
function boxManagerFactory<T extends BoxManagerClass, Extend extends { [key: PropertyKey]: any } = {}>(
  manager: T | { manager: T; extend: { [Key in keyof Extend]: PropertyDescriptor } },
  auth?: Authentication,
  networkSession?: NetworkSession | BoxManagerNetworkSession
): BoxManager<T, Extend> {
  manager = (isObject<{ manager: T; extend?: Extend }>(manager) && manager.manager && manager.extend ? manager.manager : manager) as T;

  const UseBoxManager = new Proxy(manager, {
    construct(ctor, args) {
      const managerExtends = {
        withAsUserHeader(this: BoxManager<T, Extend>, userId: string) {
          return new UseBoxManager({
            auth: this.auth,
            networkSession: this.networkSession.withAdditionalHeaders({
              'As-User': userId
            })
          });
        },

        withCustomAgentOptions(this: BoxManager<T, Extend>, agentOptions: AgentOptions) {
          return new UseBoxManager({
            auth: this.auth,
            networkSession: this.networkSession.withCustomAgentOptions(agentOptions)
          });
        },

        withCustomBaseUrls(this: BoxManager<T, Extend>, baseUrlsInput: BaseUrlsInput) {
          return new UseBoxManager({
            auth: this.auth,
            networkSession: this.networkSession.withCustomBaseUrls(new BaseUrls(baseUrlsInput))
          });
        },

        withExtraHeaders(this: BoxManager<T, Extend>, extraHeaders?: { [p: string]: string }) {
          return new UseBoxManager({
            auth: this.auth,
            networkSession: this.networkSession.withAdditionalHeaders(extraHeaders)
          });
        },

        withInterceptors(this: BoxManager<T, Extend>, interceptors: Interceptor[]) {
          return new UseBoxManager({
            auth: this.auth,
            networkSession: this.networkSession.withInterceptors(interceptors)
          });
        },

        withNetworkClient(this: BoxManager<T, Extend>, networkClient: NetworkSession['networkClient']) {
          return new UseBoxManager({
            auth: this.auth,
            networkSession: this.networkSession.withNetworkClient(networkClient)
          });
        },

        withProxy(this: BoxManager<T, Extend>, config: ProxyConfig) {
          return new UseBoxManager({
            auth: this.auth,
            networkSession: this.networkSession.withProxy(config)
          });
        },

        withSuppressedNotifications(this: BoxManager<T, Extend>) {
          return new UseBoxManager({
            auth: this.auth,
            networkSession: this.networkSession.withAdditionalHeaders({
              'Box-Notifications': 'off'
            })
          });
        }
      };

      const mapped = objectMap(managerExtends, (k, v) => ([k, {
        value: v
      }]));

      // const instance = Reflect.construct(ctor, args);
      return new Proxy(Reflect.construct(ctor, args), {
        get(target, key) {
          if (key in managerExtends) {
            return Reflect.get(managerExtends, key).bind(target);
          }
          return Reflect.get(target, key);
        }
      });
      // const proto = ctor.prototype;
      // const keys = Object.getOwnPropertyNames(proto).concat(Object.getOwnPropertySymbols(proto) as any);
      // const newProto = Object.create(proto);
      //
      // for (const key of keys) {
      //   Object.defineProperty(newProto, key, Reflect.getOwnPropertyDescriptor(proto, key)!);
      // }
      //
      // Object.assign(newProto, managerExtends);
      // Object.setPrototypeOf(instance, newProto);
    }
  });

  const { debug, proxy } = useRuntimeConfig().public.box;

  if (!networkSession) {
    networkSession = new NetworkSession({
      baseUrls: new BaseUrls(
        import.meta.client && !auth && proxy
          ? {
              baseUrl: `${ensureSuffix('/', proxy)}api`,
              uploadUrl: `${ensureSuffix('/', proxy)}upload`
            }
          : {}
      )
    });
  } else if (!(networkSession instanceof NetworkSession)) {
    if (!networkSession.baseUrls) {
      networkSession = new NetworkSession({ ...networkSession, baseUrls: new BaseUrls({}) });
    } else if (!(networkSession.baseUrls instanceof BaseUrls)) {
      networkSession = new NetworkSession({ ...networkSession, baseUrls: new BaseUrls(networkSession.baseUrls) });
    }
  }

  networkSession = (networkSession as NetworkSession).withAdditionalHeaders({ 'Access-Control-Allow-Origin': '*' });
  if (import.meta.dev && debug) {
    networkSession = (networkSession as NetworkSession).withInterceptors([
      {
        afterRequest(response) {
          console.log('Box Response: >>>  ', response.url);
          return response;
        },
        beforeRequest(options) {
          console.log('Box Request: >>>  ', options.url);
          return options;
        }
      }
    ]);
  }

  return (new UseBoxManager({ auth: auth ?? useBoxAuth(), networkSession: networkSession as NetworkSession })) as BoxManager<T, Extend>;
}
