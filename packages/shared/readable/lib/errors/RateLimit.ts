import { RateLimitErrors } from '@sentinel/contracts/shared/errors';
import { defineErrors } from '../utils/errors/define-errors';

export const RateLimitError = defineErrors(RateLimitErrors);