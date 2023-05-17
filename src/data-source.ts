import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from 'src/entity/user';
import { Address } from 'src/entity/address';

export const appDataSource = new DataSource({
  type: 'postgres',
  url: '',
  synchronize: true,
  logging: false,
  entities: [User, Address],
  migrations: [],
  subscribers: [],
});
