import Operator from '../models/Operator';
import OperatorService from '../services/Operator';
import BaseController from '@readable/controllers/BaseController';
import { IdParam } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { operatorRoutes } from '@sentinel/contracts/operators/routes';
import { CurrentOperator } from '../middlewares/CurrentOperator';
import { OperatorRoute } from '../middlewares/OperatorRoute';

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
