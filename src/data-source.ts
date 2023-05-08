import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/user';

export const appDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'joao',
  password: '1234',
  database: 'onboard_db',
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
