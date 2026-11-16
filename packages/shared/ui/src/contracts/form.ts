import { IValidation } from 'typia';
import { FormEvent } from 'react';

type Validator<T = unknown> = (input: T) => IValidation<unknown>;

export interface FormOptions<T>{
    validate: Validator<T>;
    initialValues: T;
    onSubmit: (values: T) => void | Promise<void>;
    submitErrorMessage: (error: Error) => string | null;
}

export interface FieldBinding<V>{
    name: string;
    value: V;
    onChange: (value: V) => void;
    onBlur: () => void;
    isInvalid: boolean;
    errorMessage: string | undefined;
}

export interface FormApi<T>{
    values: T;
    submitting: boolean;
    submitError: string | null;
    field: <K extends keyof T>(name: K) => FieldBinding<T[K]>;
    handleSubmit: (event?: FormEvent) => void;
    setValues: (patch: Partial<T>) => void;
    reset: () => void;
}

export type ErrorMap = Partial<Record<string, string>>;

export type TouchedMap = Partial<Record<string, boolean>>;
