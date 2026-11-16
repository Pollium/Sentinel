import Operator from '@/modules/operators/models/Operator';
import SessionService from './Session';
import PasswordService from '@readable/auth/PasswordService';
import { AuthError } from '@readable/auth/errors';
import { sessionCutoffs } from '@readable/auth/verifiedSession';
import { ChangePasswordInput, UpdateProfileInput } from '@sentinel/contracts/auth/http';
import { Session } from '../contracts/domain/session';

export default class ProfileService{
    #password = new PasswordService();
    #session = new SessionService();

    async update(operator: Operator, patch: UpdateProfileInput): Promise<Operator>{
        operator.name = patch.name;
        await Operator.update({ id: operator.id }, { name: operator.name });

        return operator;
    }

    async changePassword(operator: Operator, input: ChangePasswordInput): Promise<Session>{
        if(!(await this.#password.verify(input.currentPassword, operator.passwordHash))) throw AuthError.WrongPassword();

        operator.passwordHash = await this.#password.hash(input.newPassword);
        await Operator.update({ id: operator.id }, { passwordHash: operator.passwordHash });
        await sessionCutoffs.cut(operator.id);

        return this.#session.issue(operator);
    }
}
