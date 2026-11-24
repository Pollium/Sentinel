import { defineErrors } from '@pollium/readable/app/errors';
import { PoolErrors, ProviderErrors } from '@sentinel/contracts/providers/errors';

export const PoolError = defineErrors(PoolErrors);
export const ProviderError = defineErrors(ProviderErrors);
