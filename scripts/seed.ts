import * as dotenv from 'dotenv';
import { Faker, pt_BR } from '@faker-js/faker';
import { hash } from 'bcrypt';
import { appDataSource } from 'src/data-source';
import { User } from 'src/entity/user';

const faker = new Faker({ locale: [pt_BR] });

async function makeFakeUser() {
  const user = new User();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const birthDate = faker.date.birthdate();

  Object.assign(user, {
    name: firstName + ' ' + lastName,
    email: faker.internet.email({ firstName, lastName }),
    birthDate: birthDate.getDay() + '/' + birthDate.getMonth() + '/' + birthDate.getFullYear(),
    password: await hash(faker.internet.password({ length: 20 }), 10),
  });

  return user;
}

export async function saveFakeUsers(count = 50) {
  const users = await Promise.all([...Array(count).keys()].map(() => makeFakeUser()));
  const userRepository = appDataSource.getRepository(User);
  return userRepository.save(users);
}

async function seed() {
  dotenv.config({ path: 'test.env' });
  await appDataSource.setOptions({ url: process.env.DB_URL }).initialize();
  return saveFakeUsers();
}

seed();
