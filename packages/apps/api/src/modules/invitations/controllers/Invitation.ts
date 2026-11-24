import InvitationService from '../services/Invitation';
import BaseController, { Controller, Route, Status } from '@pollium/readable/http/Controller';
import { Body, IdParam } from '@pollium/readable/http/params';
import { Middleware } from '@pollium/readable/http/middleware';
import { InviteInput } from '@sentinel/contracts/invitations/http';
import { invitationRoutes } from '@sentinel/contracts/invitations/routes';
import { OperatorRoute } from '@/modules/operators/middlewares/OperatorRoute';

@Controller('/tower')
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
