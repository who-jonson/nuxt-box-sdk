import { BoxSdkError } from 'box-node-sdk/box/errors';

import { createError } from '#imports';

export function createBoxSdkError(err: any) {
  if (err instanceof BoxSdkError) {
    return createError(JSON.parse(err?.message || '{}'));
  }

  return createError(err);
}
