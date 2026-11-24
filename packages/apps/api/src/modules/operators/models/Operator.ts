import { BaseModel, Hidden } from '@pollium/readable/database/models';
import { Column, Entity } from 'typeorm';

@Entity()
export default class Operator extends BaseModel{
    @Column({ type: 'varchar', unique: true })
    email!: string;

    @Column('varchar')
    name!: string;

    @Column('varchar')
    @Hidden()
    passwordHash!: string;

    @Column({ type: Date, nullable: true })
    lastSignInAt!: Date | null;
}
