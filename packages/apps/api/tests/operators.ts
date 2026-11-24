import Operator from '@/modules/operators/models/Operator';
import { JWTService } from '@pollium/readable/auth/sessions';
import { PasswordService } from '@pollium/readable/auth/credentials';
import { uuid } from './uuid';
import { vi } from 'vitest';

export const OPERATOR_ID = uuid(1);
export const OPERATOR_PASSWORD = 'operator-password';

const EARLIER_BY_MS = 60_000;
const passwordHash = await new PasswordService().hash(OPERATOR_PASSWORD);
let sequence = 0;

export const seedOperator = (overrides: Partial<Operator> = {}): Promise<Operator> => {
    sequence += 1;

    return Object.assign(Operator.create({
        email: `operator${sequence}@sentinel.test`,
        name: `Operator ${sequence}`,
        passwordHash,
        lastSignInAt: null
    }), overrides).save();
};

export const tokenFor = (operatorId: string): string => new JWTService().sign(operatorId);

export const tokenIssuedEarlier = (operatorId: string): string => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.now() - EARLIER_BY_MS);
    const token = tokenFor(operatorId);
    vi.useRealTimers();

    return token;
};

export const bearer = (token: string): Record<string, string> => ({
    authorization: `Bearer ${token}`
});

export const operatorHeaders = (): Record<string, string> => bearer(tokenFor(OPERATOR_ID));
