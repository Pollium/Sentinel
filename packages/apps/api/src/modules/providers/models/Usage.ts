import { BaseModel } from '@pollium/readable/database/models';
import { GatewayKind } from '@sentinel/contracts/providers/domain';
import { Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['createdAt'])
export default class Usage extends BaseModel{
    @Column('uuid')
    providerId!: string;

    @Column('uuid', { nullable: true })
    apiKeyId!: string | null;

    @Column('varchar')
    kind!: GatewayKind;

    @Column('varchar')
    model!: string;

    @Column('integer', { default: 0 })
    inputTokens!: number;

    @Column('integer', { default: 0 })
    cachedTokens!: number;

    @Column('integer', { default: 0 })
    outputTokens!: number;

    @Column('double precision', { default: 0 })
    costUsd!: number;

    @Column('integer')
    latencyMs!: number;

    @Column('integer')
    status!: number;
}
