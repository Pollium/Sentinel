import { BaseModel, Hidden } from '@pollium/readable/database/models';
import { Column, Entity } from 'typeorm';

@Entity()
export default class ApiKey extends BaseModel{
    @Column('varchar')
    name!: string;

    @Column({ type: 'varchar', unique: true })
    @Hidden()
    keyHash!: string;

    @Column('varchar')
    preview!: string;

    @Column('boolean', { default: true })
    isActive!: boolean;
}
