import { ErrorCopy } from '../contracts/errors';
import { ErrorNotice } from '../contracts/notice';
import { toError } from '../utils/format/errors';
import { sileo, SileoOptions } from 'sileo';

const LIFETIME_MS = 10_000;
const ACTION_GRACE_MS = 4000;
const COLLAPSE_LEAD_MS = 1500;
const MAX_VISIBLE = 3;

interface KeyedOptions extends SileoOptions{
    id: string;
}

let issued = 0;
const shown: string[] = [];
const waiting: (() => void)[] = [];

const nextKey = (): string => {
    issued += 1;

    return `notice-${issued}`;
};

const track = (key: string) => {
    shown.push(key);
    for(const evicted of shown.splice(0, Math.max(0, shown.length - MAX_VISIBLE))){
        sileo.dismiss(evicted);
    }
};

const buttonOf = (key: string, retry: (() => void) | undefined): SileoOptions['button'] => {
    if(retry === undefined) return undefined;

    return {
        title: 'Try again',
        onClick: () => {
            sileo.dismiss(key);
            retry();
        }
    };
};

const optionsOf = (key: string, description: string, { title, retry }: ErrorNotice): KeyedOptions => {
    const duration = LIFETIME_MS + (retry === undefined ? 0 : ACTION_GRACE_MS);

    return {
        id: key,
        title,
        description,
        duration,
        autopilot: { collapse: duration - COLLAPSE_LEAD_MS },
        button: buttonOf(key, retry)
    };
};

const whenVisible = (show: () => void) => {
    if(document.visibilityState === 'visible'){
        show();
        return;
    }

    waiting.push(show);
};

document.addEventListener('visibilitychange', () => {
    if(document.visibilityState !== 'visible') return;

    for(const show of waiting.splice(0)) show();
});

export const notifyError = (cause: unknown, copy: ErrorCopy, notice: ErrorNotice): void => {
    const key = nextKey();
    const options = optionsOf(key, copy(toError(cause)), notice);

    whenVisible(() => {
        sileo.error(options);
        track(key);
    });
};

export const notifyWith = (copy: ErrorCopy, notice: ErrorNotice) => (cause: unknown): void =>
    notifyError(cause, copy, notice);
