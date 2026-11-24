import { BaseModel } from '@pollium/readable/database/models';
import { GatewayKind } from '@sentinel/contracts/providers/domain';
import { GatewayFailureCause } from '@sentinel/contracts/usage/domain';
import { Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['createdAt'])
export default class Failure extends BaseModel{
    @Column('uuid')
    providerId!: string;

    @Column('uuid')
    apiKeyId!: string;

    @Column('varchar')
    kind!: GatewayKind;

    @Column('varchar')
    model!: string;

    @Column('varchar')
    cause!: GatewayFailureCause;

    @Column('integer')
    status!: number;

    @Column('integer')
    latencyMs!: number;
}
