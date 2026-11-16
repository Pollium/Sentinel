import BaseModel from '@readable/models/BaseModel';
import { Hidden } from '@readable/models/Hidden';
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
