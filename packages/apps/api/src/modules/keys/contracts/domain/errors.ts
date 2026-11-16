import { defineErrors } from '@readable/utils/errors/define-errors';
import { ApiKeyErrors } from '@sentinel/contracts/keys/errors';

export const ApiKeyError = defineErrors(ApiKeyErrors);
