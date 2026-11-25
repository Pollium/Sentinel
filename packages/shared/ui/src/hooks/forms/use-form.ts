import { ErrorMap, FormApi, FormOptions, TouchedMap } from '../../contracts/form';
import { ApiError, toError } from '@pollium/readable-react/http/ApiError';
import { FieldBinding } from '@pollium/readable-react/forms/useForm';
import { fieldOf, messageOf } from '@pollium/readable-react/forms/messages';
import { useRef, useState, FormEvent } from 'react';

export const useForm = <T extends object>({
    validate: validateInput,
    initialValues,
    onSubmit,
    submitErrorMessage
}: FormOptions<T>): FormApi<T> => {
    const initialRef = useRef(initialValues);
    const [values, setValuesState] = useState<T>(initialValues);
    const [errors, setErrors] = useState<ErrorMap>({});
    const [submitting, setSubmittingState] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const valuesRef = useRef(values);
    const touchedRef = useRef<TouchedMap>({});
    const submittingRef = useRef(submitting);

    const commitValues = (next: T) => {
        valuesRef.current = next;
        setValuesState(next);
    };

    const commitSubmitting = (next: boolean) => {
        submittingRef.current = next;
        setSubmittingState(next);
    };

    const mergeValues = (base: T, patch: Partial<T>): T => ({ ...base, ...patch });

    const validate = (input: T): ErrorMap => {
        const result = validateInput(input);
        if(result.success) return {};

        const map: ErrorMap = {};
        for(const error of result.errors){
            const key = fieldOf(error.path);
            if(!(key in map)) map[key] = messageOf(error);
        }
        return map;
    };

    const applyFieldError = (key: string, map: ErrorMap) => {
        setErrors((prev) => {
            const next = { ...prev };
            if(map[key]) next[key] = map[key];
            else delete next[key];
            return next;
        });
    };

    const handleChange = (key: string, value: unknown) => {
        const next = mergeValues(valuesRef.current, { [key]: value } as Partial<T>);
        commitValues(next);
        if(touchedRef.current[key]) applyFieldError(key, validate(next));
    };

    const handleBlur = (key: string) => {
        touchedRef.current[key] = true;
        if(submittingRef.current) return;
        applyFieldError(key, validate(valuesRef.current));
    };

    const applySubmitError = (cause: unknown) => {
        const error = toError(cause);
        const message = submitErrorMessage(error);
        if(message === null) return;

        if(error instanceof ApiError) setErrors((prev) => ({ ...prev, ...error.fields }));

        setSubmitError(message);
    };

    const handleSubmit = (event?: FormEvent) => {
        event?.preventDefault();
        if(submittingRef.current) return;

        const current = valuesRef.current;
        const map = validate(current);
        for(const key of Object.keys(current)) touchedRef.current[key] = true;
        setErrors(map);
        if(Object.keys(map).length > 0) return;

        setSubmitError(null);
        commitSubmitting(true);

        const submit = async () => {
            try{
                await onSubmit(current);
                commitSubmitting(false);
            }catch(error: unknown){
                commitSubmitting(false);
                applySubmitError(error);
            }
        };

        void submit();
    };

    const field = <K extends keyof T>(name: K): FieldBinding<T[K]> => {
        const key = name as string;
        return {
            name: key,
            value: values[name],
            onChange: (value) => handleChange(key, value),
            onBlur: () => handleBlur(key),
            isInvalid: errors[key] !== undefined,
            errorMessage: errors[key]
        };
    };

    const setValues = (patch: Partial<T>) => {
        commitValues(mergeValues(valuesRef.current, patch));
        setErrors((prev) => {
            const next = { ...prev };
            for(const key of Object.keys(patch)) delete next[key];
            return next;
        });
    };

    const reset = () => {
        commitValues(initialRef.current);
        setErrors({});
        touchedRef.current = {};
        commitSubmitting(false);
        setSubmitError(null);
    };

    return {
        values,
        submitting,
        submitError,
        field,
        handleSubmit,
        setValues,
        reset
    };
};
