import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/user';

export const appDataSource = new DataSource({
  type: 'postgres',
  url: '',
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
