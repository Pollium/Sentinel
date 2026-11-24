import { defineErrors } from '@pollium/readable/app/errors';
import { ApiKeyErrors } from '@sentinel/contracts/keys/errors';

export const ApiKeyError = defineErrors(ApiKeyErrors);
