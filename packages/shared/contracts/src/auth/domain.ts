import { Operator } from '../operators/domain';

export interface Session{
    token: string;
    operator: Operator;
}

export interface SetupStatus{
    needsOwner: boolean;
}
