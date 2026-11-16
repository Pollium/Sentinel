import { RequestErrors } from '@sentinel/contracts/shared/errors';
import { defineErrors } from '../utils/errors/define-errors';

export const RequestError = defineErrors(RequestErrors);
