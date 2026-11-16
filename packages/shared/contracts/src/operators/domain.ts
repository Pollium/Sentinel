import { BaseEntity } from '../shared/base';

export interface Operator extends BaseEntity{
    name: string;
    email: string;
    lastSignInAt: string | null;
}
