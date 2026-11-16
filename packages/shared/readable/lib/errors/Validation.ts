import RuntimeError from './RuntimeError';
import { RequestError } from './Request';

export default class ValidationError extends RuntimeError{
    constructor(readonly errors: Record<string, string>){
        const { message, statusCode } = RequestError.ValidationFailed();
        super(message, statusCode);
    }
}
