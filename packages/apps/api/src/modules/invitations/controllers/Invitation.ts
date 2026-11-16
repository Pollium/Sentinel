import InvitationService from '../services/Invitation';
import BaseController from '@readable/controllers/BaseController';
import { Body, IdParam } from '@readable/decorators/controllers/RequestParams';
import { Route } from '@readable/decorators/controllers/Route';
import { Status } from '@readable/decorators/controllers/Status';
import { Middleware } from '@readable/decorators/middleware/Middleware';
import { InviteInput } from '@sentinel/contracts/invitations/http';
import { invitationRoutes } from '@sentinel/contracts/invitations/routes';
import { OperatorRoute } from '@/modules/operators/middlewares/OperatorRoute';

@Middleware(OperatorRoute)
export default class InvitationController extends BaseController{
    #service = new InvitationService();

    @Route(invitationRoutes.list)
    list(){
        return this.#service.pending();
    }

    @Route(invitationRoutes.create)
    @Status(201)
    create(@Body() body: InviteInput){
        return this.#service.create(body);
    }

    @Route(invitationRoutes.revoke)
    revoke(@IdParam('invitationId') invitationId: string){
        return this.#service.revoke(invitationId);
    }
}
