import Operator from '@/modules/operators/models/Operator';
import ProfileService from '../services/Profile';
import BaseController from '@readable/controllers/BaseController';
import { Body } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { ChangePasswordInput, UpdateProfileInput } from '@sentinel/contracts/auth/http';
import { authRoutes } from '@sentinel/contracts/auth/routes';
import { CurrentOperator } from '@/modules/operators/middlewares/CurrentOperator';
import { OperatorRoute } from '@/modules/operators/middlewares/OperatorRoute';

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
