import { PendingArgs, Query, QueryOptions, QuerySnapshot, Request } from '../../contracts/api';
import { toError } from '../../utils/format/errors';
import { Method } from 'alova';
import { useEffect, useRef, useState } from 'react';

const EMPTY: PendingArgs<[]> = [];

const dispatch = <O>(pending: PromiseLike<O>, force: boolean): PromiseLike<O> =>
    force && pending instanceof Method ? pending.send(true) as Promise<O> : pending;

export const useQuery = <A extends readonly unknown[], O>(
    request: Request<A, O>,
    args: PendingArgs<A> = EMPTY as PendingArgs<A>,
    { enabled = true }: QueryOptions = {}
): Query<O> => {
    const ready = enabled && args.every((arg) => arg !== undefined);

    const [attempt, setAttempt] = useState(0);
    const [snapshot, setSnapshot] = useState<QuerySnapshot<O> | null>(null);

    const key = ready ? JSON.stringify(args) : null;

    const latest = useRef({ request, args, key });
    const forced = useRef(false);
    const runs = useRef({ issued: 0, landed: 0 });
    useEffect(() => {
        latest.current = { request, args, key };
    });

    useEffect(() => {
        if(key === null){
            setSnapshot(null);
            return;
        }

        runs.current.issued += 1;
        const run = runs.current.issued;
        const force = forced.current;
        forced.current = false;

        setSnapshot((previous) => ({
            args: key,
            status: 'loading',
            data: previous?.args === key ? previous.data : null,
            error: undefined
        }));

        const load = async () => {
            try{
                const data = await dispatch(latest.current.request(...latest.current.args as A), force);
                if(latest.current.key !== key || run < runs.current.landed) return;

                runs.current.landed = run;
                setSnapshot({ args: key, status: run === runs.current.issued ? 'success' : 'loading', data, error: undefined });
            }catch(cause: unknown){
                if(latest.current.key !== key || run !== runs.current.issued) return;

                runs.current.landed = run;
                setSnapshot((previous) => ({
                    args: key,
                    status: 'error',
                    data: previous?.args === key ? previous.data : null,
                    error: toError(cause)
                }));
            }
        };

        void load();
    }, [key, attempt]);

    const fresh = snapshot?.args === key ? snapshot : null;

    return {
        loading: ready && (fresh === null || fresh.status === 'loading'),
        data: fresh?.data ?? null,
        error: fresh?.error,
        reload: () => {
            forced.current = true;
            setAttempt((value) => value + 1);
        }
    };
};
