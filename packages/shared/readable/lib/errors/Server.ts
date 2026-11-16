import { ServerErrors } from '@sentinel/contracts/shared/errors';
import { defineErrors } from '../utils/errors/define-errors';

export const ServerError = defineErrors(ServerErrors);
