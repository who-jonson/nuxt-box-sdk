import type { Schema } from 'untyped';

import { objectPick } from '@whoj/utils-core';
import { useNuxt, extendNuxtSchema } from '@nuxt/kit';

const schemaProperties = {
  auth: {
    description: 'When application running in development mode & provided `developer.token` Then `developer.token` will be used as default auth',
    title: 'Default Auth to use',
    tsType: 'import(\'#nuxt/box-sdk/types\').BoxAuthType',
    type: 'string'
  },
  ccg: {
    title: 'Client Credentials Grant Config',
    tsType: 'import(\'#nuxt/box-sdk/types\').BoxCcgConfig',
    type: 'object'
  },
  debug: {
    default: false,
    title: 'Debug',
    type: 'boolean'
  },
  developer: {
    description: 'Can be provided as Environment Variable - BOX_DEVELOPER_TOKEN | NUXT_BOX_DEVELOPER_TOKEN | NUXT_PUBLIC_BOX_DEVELOPER_TOKEN',
    title: 'Box Developer Token',
    tsType: 'import(\'#nuxt/box-sdk/types\').BoxDeveloperTokenConfig',
    type: 'object'
  },
  jwt: {
    title: 'Jwt Auth Config',
    tsType: '{ configFile: `${string}.json` } | import(\'#nuxt/box-sdk/types\').BoxJwtConfig',
    type: 'object'
  },
  managers: {
    description: 'In production, you provably don\'t need all the managers. Box by default include all the managers with client\nSo, by configuring `managers` you may decrease you bundle at a significant size',
    properties: {
      exclude: {
        items: {
          tsType: 'import(\'#nuxt/box-sdk/types\').BoxManagerNames',
          type: 'string'
        },
        tsType: 'import(\'#nuxt/box-sdk/types\').BoxManagerNames[]',
        type: 'array'
      },
      include: {
        items: {
          tsType: 'import(\'#nuxt/box-sdk/types\').BoxManagerNames',
          type: 'string'
        },
        tsType: 'import(\'#nuxt/box-sdk/types\').BoxManagerNames[]',
        type: 'array'
      }
    },
    title: 'Box Managers',
    type: 'object'
  },
  oauth: {
    title: 'OAuth 2.0  Config',
    tsType: 'import(\'#nuxt/box-sdk/types\').BoxOAuthConfig',
    type: 'object'
  },
  tokenStorage: {
    title: 'Nitro (unstorage) mount point',
    type: 'string'
  }
} satisfies Schema['properties'];

export function addBoxSchema(nuxt = useNuxt()) {
  extendNuxtSchema(() => ({
    box: {
      $schema: {
        properties: schemaProperties,
        title: 'Box TypeScript SDK'
      }
    },
    runtimeConfig: {
      box: {
        $schema: {
          properties: objectPick(schemaProperties, ['ccg', 'jwt', 'oauth']),
          title: 'Box Runtime Config'
        }
      },
      public: {
        box: {
          $schema: {
            properties: objectPick(schemaProperties, ['debug', 'developer', 'auth']),
            title: 'Box Public Runtime Config'
          }
        }
      }
    }
  }));
}
