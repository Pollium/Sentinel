import { BaseModel, Hidden } from '@pollium/readable/database/models';
import { Column, Entity } from 'typeorm';

@Entity()
export default class Invitation extends BaseModel{
    @Column('varchar')
    email!: string;

    @Column({ type: 'varchar', unique: true })
    @Hidden()
    tokenHash!: string;

    @Column({ type: Date })
    expiresAt!: Date;
}
