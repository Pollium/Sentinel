import { Operator } from '../operators/domain';
import { get, patch, post } from '@pollium/readable-contracts/routing';
import { Session, SetupStatus } from './domain';
import { ChangePasswordInput, SetupInput, SignInInput, UpdateProfileInput } from './http';

export const authRoutes = {
    setupStatus: get<SetupStatus>('/tower/auth/setup'),
    setup: post<SetupInput, Session>('/tower/auth/setup'),
    signIn: post<SignInInput, Session>('/tower/auth/sign-in'),
    me: get<Operator>('/tower/me'),
    updateProfile: patch<UpdateProfileInput, Operator>('/tower/me'),
    changePassword: post<ChangePasswordInput, Session>('/tower/me/password')
};
