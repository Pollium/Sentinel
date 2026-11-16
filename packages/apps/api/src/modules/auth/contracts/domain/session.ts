import Operator from '@/modules/operators/models/Operator';

export interface Session{
    token: string;
    operator: Operator;
}
