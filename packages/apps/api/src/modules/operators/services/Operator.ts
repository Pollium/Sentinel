import Operator from '../models/Operator';
import { AuthError } from '@readable/auth/errors';
import { sessionCutoffs } from '@readable/auth/verifiedSession';
import { OperatorError } from '../contracts/domain/errors';
import { lockRoster } from '../utils/roster-lock';

export default class OperatorService{
    list(): Promise<Operator[]>{
        return Operator.find({ order: { createdAt: 'ASC' } });
    }

    async remove(actorId: string, operatorId: string){
        if(actorId === operatorId) throw OperatorError.RemoveSelf();

        await Operator.getRepository().manager.transaction(async (manager) => {
            await lockRoster(manager);
            if(!(await manager.existsBy(Operator, { id: actorId }))) throw AuthError.Unauthorized();

            const operator = await manager.findOneBy(Operator, { id: operatorId });
            if(operator === null) throw OperatorError.NotFound();

            await manager.remove(operator);
        });
        await sessionCutoffs.cut(operatorId);
    }
}
