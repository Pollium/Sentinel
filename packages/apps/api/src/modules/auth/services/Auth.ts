import Operator from '@/modules/operators/models/Operator';
import SessionService from './Session';
import { PasswordService } from '@pollium/readable/auth/credentials';
import { AuthError } from '../contracts/domain/errors';
import { SetupStatus } from '@sentinel/contracts/auth/domain';
import { SetupInput, SignInInput } from '@sentinel/contracts/auth/http';
import { Session } from '../contracts/domain/session';
import { lockRoster } from '@/modules/operators/utils/roster-lock';
import { randomUUID } from 'node:crypto';

export default class AuthService{
    #password = new PasswordService();
    #session = new SessionService();
    #unknownOperatorHash = this.#password.hash(randomUUID());

    async setupStatus(): Promise<SetupStatus>{
        return { needsOwner: !(await Operator.exists()) };
    }

    async setup(input: SetupInput): Promise<Session>{
        const owner = await Operator.getRepository().manager.transaction(async (manager) => {
            await lockRoster(manager);
            if(await manager.exists(Operator)) throw AuthError.SetupClosed();

            return manager.save(Operator.create({
                email: input.email.toLowerCase(),
                name: input.name,
                passwordHash: await this.#password.hash(input.password),
                lastSignInAt: null
            }));
        });

        return this.#session.open(owner);
    }

    async signIn(input: SignInInput): Promise<Session>{
        const operator = await Operator.findOneBy({ email: input.email.toLowerCase() });
        const matches = await this.#password.verify(input.password, operator?.passwordHash ?? await this.#unknownOperatorHash);
        if(operator === null || !matches) throw AuthError.InvalidCredentials();

        return this.#session.open(operator);
    }
}
