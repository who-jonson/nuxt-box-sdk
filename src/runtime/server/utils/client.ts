import type { Authentication, NetworkSessionInput } from 'box-node-sdk/networking';

import { objectKeys } from '@whoj/utils-core';
import { BaseUrls, NetworkSession } from 'box-node-sdk/networking';

import type { BoxAuthType, BoxNetworkOptions } from '#nuxt/box-sdk/types';

import { useRuntimeConfig } from '#imports';
import { BoxClient } from '#nuxt/box-sdk/client';
import { isAuthentication } from '#nuxt/box-sdk/utils';

import type { UseBoxAuthReturns, UseBoxAuthConfigInput } from './auth';

import { useBoxAuth } from './auth';

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxClient<T extends Authentication = Authentication>(auth?: T, session?: NetworkSession | BoxNetworkOptions): BoxClient<T>;
/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxCcgClient(authConfig?: UseBoxAuthConfigInput<'ccg'>, session?: NetworkSession | BoxNetworkOptions) {
  return useBoxClient('ccg', authConfig, session);
}
/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxJwtClient(authConfig?: UseBoxAuthConfigInput<'jwt'>, session?: NetworkSession | BoxNetworkOptions) {
  return useBoxClient('jwt', authConfig, session);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxOAuthClient(authConfig?: UseBoxAuthConfigInput<'oauth'>, session?: NetworkSession | BoxNetworkOptions) {
  return useBoxClient('oauth', authConfig, session);
}

export function useBoxClient<T extends BoxAuthType = BoxAuthType>(auth?: T, authConfig?: UseBoxAuthConfigInput<T>, session?: NetworkSession | BoxNetworkOptions): BoxClient<UseBoxAuthReturns<T>>;

export function useBoxClient(...args: any[]) {
  const client = new BoxClient({
    auth: isAuthentication(args[0])
      ? args[0]
      : useBoxAuth(args[0], args[1])!,

    networkSession: netWorkSession(
      isAuthentication(args[0])
        ? args[1]
        : args[2]
    )
  });

  if (import.meta.dev) {
    return client.withInterceptors([
      {
        afterRequest(response) {
          if (useRuntimeConfig().public.box.debug) {
            console.log('Box Response: >>>  ', response.data);
          }
          return response;
        },
        beforeRequest(options) {
          if (useRuntimeConfig().public.box.debug) {
            console.log('Box Request: >>>  ', options.url);
          }
          return options;
        }
      }
    ]);
  }

  return client;
}

/**
 * @internal
 */
function netWorkSession(session?: NetworkSession | BoxNetworkOptions): undefined | NetworkSession {
  if (!session) {
    return;
  }

  if (session instanceof NetworkSession) {
    return session;
  }

  const { asUser, suppressNotifications, ...fields } = session;
  const headers = { ...(fields.additionalHeaders || {}) };

  if (asUser) {
    headers['As-User'] = asUser;
  }
  if (suppressNotifications) {
    headers['Box-Notifications'] = 'off';
  }

  if (objectKeys(headers).length) {
    fields.additionalHeaders = headers;
  }

  if (fields.baseUrls) {
    fields.baseUrls = new BaseUrls(fields.baseUrls);
  }

  return new NetworkSession(fields as NetworkSessionInput);
}
