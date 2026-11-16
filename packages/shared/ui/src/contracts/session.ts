import { Operator } from '@sentinel/contracts/operators/domain';

export interface SessionState{
    token: string | null;
    setToken: (token: string | null) => void;
    clear: (token: string | null) => void;
}

export interface SessionOutlet{
    operator: Operator;
    reloadOperator: () => void;
}
