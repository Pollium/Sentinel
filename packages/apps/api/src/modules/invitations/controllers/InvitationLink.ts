import InvitationService from '../services/Invitation';
import BaseController, { Controller, Route, Status } from '@pollium/readable/http/Controller';
import { Body, Param } from '@pollium/readable/http/params';
import { AcceptInvitationInput } from '@sentinel/contracts/invitations/http';
import { invitationRoutes } from '@sentinel/contracts/invitations/routes';

@Controller('/tower')
export default class InvitationLinkController extends BaseController{
    #service = new InvitationService();

    @Route(invitationRoutes.preview)
    preview(@Param('token') token: string){
        return this.#service.preview(token);
    }

    @Route(invitationRoutes.accept)
    @Status(201)
    accept(@Param('token') token: string, @Body() body: AcceptInvitationInput){
        return this.#service.accept(token, body);
    }
}
