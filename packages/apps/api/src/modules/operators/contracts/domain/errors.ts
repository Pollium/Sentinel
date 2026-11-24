import { defineErrors } from '@pollium/readable/app/errors';
import { OperatorErrors } from '@sentinel/contracts/operators/errors';

export const OperatorError = defineErrors(OperatorErrors);
