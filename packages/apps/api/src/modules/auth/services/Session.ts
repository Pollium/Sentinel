import Operator from '@/modules/operators/models/Operator';
import JWTService from '@readable/auth/JWTService';
import { Session } from '../contracts/domain/session';

export default class SessionService{
    #jwt = new JWTService();

    async open(operator: Operator): Promise<Session>{
        operator.lastSignInAt = new Date();
        await Operator.update({ id: operator.id }, { lastSignInAt: operator.lastSignInAt });

        return this.issue(operator);
    }

    issue(operator: Operator): Session{
        return {
            token: this.#jwt.sign(operator.id),
            operator
        };
    }
}
