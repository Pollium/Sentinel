import { ReadableDatabaseConfig } from '../config';
import { DataSource } from 'typeorm';

export const createDataSource = (database: ReadableDatabaseConfig, entities: Function[]): DataSource =>
    new DataSource({
        type: 'postgres',
        url: database.url,
        schema: database.schema,
        synchronize: database.synchronize,
        entities
    });
