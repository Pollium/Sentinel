import { del, get } from '../shared/routing';
import { Operator } from './domain';

export const operatorRoutes = {
    list: get<Operator[]>('/tower/operators'),
    remove: del('/tower/operators/:operatorId')
};
