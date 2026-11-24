import Operator from '@/modules/operators/models/Operator';
import ProfileService from '../services/Profile';
import BaseController, { Controller, Route } from '@pollium/readable/http/Controller';
import { Body } from '@pollium/readable/http/params';
import { Middleware } from '@pollium/readable/http/middleware';
import { ChangePasswordInput, UpdateProfileInput } from '@sentinel/contracts/auth/http';
import { authRoutes } from '@sentinel/contracts/auth/routes';
import { CurrentOperator } from '@/modules/operators/middlewares/CurrentOperator';
import { OperatorRoute } from '@/modules/operators/middlewares/OperatorRoute';

@Controller('/tower')
@Middleware(OperatorRoute)
export default class ProfileController extends BaseController{
    #service = new ProfileService();

    @Route(authRoutes.me)
    me(@CurrentOperator() operator: Operator){
        return operator;
    }

    @Route(authRoutes.updateProfile)
    update(@CurrentOperator() operator: Operator, @Body() body: UpdateProfileInput){
        return this.#service.update(operator, body);
    }

    @Route(authRoutes.changePassword)
    changePassword(@CurrentOperator() operator: Operator, @Body() body: ChangePasswordInput){
        return this.#service.changePassword(operator, body);
    }
}
