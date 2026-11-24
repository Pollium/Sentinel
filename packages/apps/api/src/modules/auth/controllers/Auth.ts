import AuthService from '../services/Auth';
import BaseController, { Controller, Route, Status } from '@pollium/readable/http/Controller';
import { Body } from '@pollium/readable/http/params';
import { RateLimit } from '@pollium/readable/http/middleware';
import { SetupInput, SignInInput } from '@sentinel/contracts/auth/http';
import { authRoutes } from '@sentinel/contracts/auth/routes';

@Controller('/tower')
export default class AuthController extends BaseController{
    #service = new AuthService();

    @Route(authRoutes.setupStatus)
    setupStatus(){
        return this.#service.setupStatus();
    }

    @Route(authRoutes.setup)
    @Status(201)
    setup(@Body() body: SetupInput){
        return this.#service.setup(body);
    }

    @Route(authRoutes.signIn)
    @RateLimit({ max: 5, window: '1m' })
    signIn(@Body() body: SignInInput){
        return this.#service.signIn(body);
    }
}
