import Operator from '../models/Operator';
import OperatorService from '../services/Operator';
import BaseController, { Controller, Route } from '@pollium/readable/http/Controller';
import { IdParam } from '@pollium/readable/http/params';
import { Middleware } from '@pollium/readable/http/middleware';
import { operatorRoutes } from '@sentinel/contracts/operators/routes';
import { CurrentOperator } from '../middlewares/CurrentOperator';
import { OperatorRoute } from '../middlewares/OperatorRoute';

@Controller('/tower')
@Middleware(OperatorRoute)
export default class OperatorController extends BaseController{
    #service = new OperatorService();

    @Route(operatorRoutes.list)
    list(){
        return this.#service.list();
    }

    @Route(operatorRoutes.remove)
    remove(@CurrentOperator() actor: Operator, @IdParam('operatorId') operatorId: string){
        return this.#service.remove(actor.id, operatorId);
    }
}
