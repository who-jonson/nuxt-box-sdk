import type { H3Event } from 'h3';
import type { BoxClient } from 'box-node-sdk';
import type { Class } from '@whoj/utils-types';
import type { BaseUrls, BaseUrlsInput, Authentication, NetworkSession, NetworkSessionInput } from 'box-node-sdk/networking';
import type { JwtConfigFile, CcgConfigInput, JwtConfigInput, OAuthConfigInput, DeveloperTokenConfig } from 'box-node-sdk/box';

export type BoxAuthType = 'dev' | 'jwt' | 'ccg' | 'oauth';

export type BoxCcgConfig = ConfigWithStorage<CcgConfigInput>;

export type BoxJwtConfig = ConfigWithStorage<JwtConfigInput>;

export type BoxOAuthConfig = ConfigWithStorage<OAuthConfigInput>;

export type BoxDeveloperTokenConfig = DeveloperTokenConfig & { token: string };

export interface BoxManagerNetworkSession extends Omit<NetworkSessionInput, 'baseUrls'> {
  baseUrls?: BaseUrls | BaseUrlsInput;
}

export interface BoxAuthMethods {
  ccg: BoxCcgConfig;
  dev: BoxDeveloperTokenConfig;
  jwt: BoxJwtConfig;
  oauth: BoxOAuthConfig;
}

export type BoxManager<T extends BoxManagerClass, Extends extends { [key: PropertyKey]: any } = {}> = ExtendedManager & Extends & InstanceType<T>;

export type BoxManagerClass = Class<{ auth?: Authentication; networkSession: NetworkSession }, [{ auth?: Authentication; networkSession: NetworkSession }]>;

export interface BoxNetworkOptions extends Omit<NetworkSessionInput, 'baseUrls'> {
  asUser?: string;
  baseUrls?: BaseUrlsInput;
  suppressNotifications?: boolean;
}

export type BoxManagerNames = keyof Omit<BoxClient, 'auth' | 'withProxy' | 'authorization' | 'networkSession' | 'withInterceptors' | 'withExtraHeaders' | 'withAsUserHeader' | 'withCustomBaseUrls' | 'withCustomAgentOptions' | 'withSuppressedNotifications'>;

export interface ExtendedManager extends Pick<NetworkSession, 'withProxy' | 'withInterceptors' | 'withNetworkClient' | 'withRetryStrategy' | 'withCustomBaseUrls' | 'withCustomAgentOptions'> {
  withAsUserHeader: (userId: string) => this;
  withExtraHeaders: (extraHeaders?: { [key: string]: string }) => this;
  withSuppressedNotifications: () => this;
}

export interface BoxSdkOptions {
  /**
   * Default Auth to use
   *
   * When application running in development mode & provided `developer.token`
   * Then `developer.token` will be used as default auth
   *
   * Will throw Error if empty on production
   *
   * RuntimeConfig - NUXT_PUBLIC_BOX_AUTH
   */
  auth?: BoxAuthType;

  auths?: {
    [name: string]: {
      name?: string;
      resolver: (event?: H3Event) => Authentication;
    };
  };

  /**
   * Client Credentials Grant Config
   *
   * RuntimeConfig Prefix - NUXT_BOX_CCG_
   */
  ccg?: BoxCcgConfig;

  /**
   * Box Developer Token
   *
   * Can be provided as Environment Variable - BOX_DEVELOPER_TOKEN | NUXT_BOX_DEVELOPER_TOKEN | NUXT_PUBLIC_BOX_DEVELOPER_TOKEN
   */
  developer?: BoxDeveloperTokenConfig;

  /**
   * Jwt Auth Config
   *
   * RuntimeConfig - NUXT_BOX_JWT
   * RuntimeConfig Prefix (when providing object) - NUXT_BOX_JWT_
   */
  jwt?: BoxJwtConfig | {
    /**
     * Jwt config as JSON or JSON string
     */
    configJson: string | JwtConfigFile;
  } | {
    /**
     * If provided Jwt config will be resolved from that file
     */
    configFile: `${string}.json`;
  };

  /**
   * Box Managers to register with client
   *
   * In production, you provably don't need all the managers. Box by default include all the managers with client
   * So, by configuring `managers` you may decrease you bundle at a significant size
   */
  managers?: {
    /**
     * @default true
     */
    composables?: boolean;

    include?: Array<BoxManagerNames>;

    exclude?: Array<BoxManagerNames>;
  };

  /**
   * OAuth 2.0  Config
   *
   * RuntimeConfig Prefix - NUXT_BOX_OAUTH_
   */
  oauth?: BoxOAuthConfig;
}

type ConfigWithStorage<T> = Omit<T, 'tokenStorage'> & {
  tokenStorage?: string;
};

export {};
