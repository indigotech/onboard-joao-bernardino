import { User } from './entity/user';
import { appDataSource } from './data-source';
import { UserInput } from './schema';

function validatePassword(password: string) {
  const digitRegex = /[0-9]/;
  const letterRegex = /[a-z|A-Z]/;
  return password.length > 5 && digitRegex.test(password) && letterRegex.test(password);
}

async function validateEmail(email: string) {
  const userRepository = appDataSource.getRepository(User);
  const isDuplicated = await userRepository.exist({ where: { email } });
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return !isDuplicated && emailRegex.test(email);
}

export async function validateUser(userInput: UserInput) {
  let validated = true;
  let failureReason = '';

  if (!validatePassword(userInput.password)) {
    validated = false;
    failureReason = 'Invalid Password';
  } else if (!(await validateEmail(userInput.email))) {
    validated = false;
    failureReason = 'Invalid Email';
  }
  return { validated, failureReason };
}
