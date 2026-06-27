import { BoxSdkError } from 'box-node-sdk/box/errors';

import { createError } from '#imports';

export function createBoxSdkError(err: any) {
  if (err instanceof BoxSdkError) {
    throw createError(JSON.parse(err?.message || '{}'));
  }

  throw createError(err);
}
