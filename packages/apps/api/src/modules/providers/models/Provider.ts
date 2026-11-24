import { BaseModel, Hidden } from '@pollium/readable/database/models';
import { GatewayKind, ProviderModel } from '@sentinel/contracts/providers/domain';
import { Column, Entity } from 'typeorm';

@Entity()
export default class Provider extends BaseModel{
    @Column('varchar')
    kind!: GatewayKind;

    @Column('varchar')
    name!: string;

    @Column('varchar')
    baseUrl!: string;

    @Column('varchar')
    @Hidden()
    encryptedApiKey!: string;

    @Column('boolean', { default: true })
    isActive!: boolean;

    @Column({ type: 'simple-json', default: '[]' })
    models!: ProviderModel[];

    @Column({ type: 'simple-json', default: '{}' })
    modelMap!: Record<string, string>;
}
