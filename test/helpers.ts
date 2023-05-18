import axios, { AxiosHeaders } from 'axios';
import { UserInput } from 'src/inputs';
import { appDataSource } from 'src/data-source';
import { User } from 'src/entity/user';
import * as jwt from 'jsonwebtoken';
import { hash } from 'bcrypt';
import { Address } from 'src/entity/address';

export const userRepository = appDataSource.getRepository(User);
export const addressRepository = appDataSource.getRepository(Address);

export function getValidToken() {
  const expiresIn = Date.now() / 1000 + +process.env.JWT_EXPIRATION_HOURS! * 3600 + 's';
  return jwt.sign({ id: 1 }, process.env.JWT_PRIVATE_KEY!, { expiresIn });
}

export function makeRequest({ query, variables, token }: { query: string; variables: object; token?: string }) {
  return axios.post(
    `http://localhost:${process.env.PORT}/`,
    { query, variables },
    { headers: { Authorization: token } },
  );
}

export async function insertUserInDB(fields: UserInput) {
  const newUser = new User();
  Object.assign(newUser, fields);
  newUser.password = await hash(fields.password, 10);
  await userRepository.save(newUser);
  return newUser;
}

export async function insertAddressInDB(fields: {
  cep: string;
  street: string;
  streetNumber: number;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  user: User;
}) {
  const newAddress = new Address();
  Object.assign(newAddress, fields);
  await addressRepository.save(newAddress);
  return newAddress;
}