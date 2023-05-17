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

async function seed() {
  dotenv.config({ path: 'test.env' });
  await appDataSource.setOptions({ url: process.env.DB_URL }).initialize();
  const userRepository = appDataSource.getRepository(User);

  const promises: Promise<User>[] = [];
  for (let i = 0; i < 50; i++) {
    promises.push(userRepository.save(await makeFakeUser()));
  }
  return Promise.all(promises);
}

seed();
