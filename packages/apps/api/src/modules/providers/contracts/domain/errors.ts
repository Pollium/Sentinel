import { defineErrors } from '@readable/utils/errors/define-errors';
import { PoolErrors, ProviderErrors } from '@sentinel/contracts/providers/errors';

export const PoolError = defineErrors(PoolErrors);
export const ProviderError = defineErrors(ProviderErrors);
