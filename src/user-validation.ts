import { User } from './entity/user';
import { appDataSource } from './data-source';
import { UserInput } from './schema';

function validatePassword(password: string) {
  const digitRegex = /[0-9]/;
  const letterRegex = /[a-z|A-Z]/;

  const validations = [
    { validated: password.length > 5, failureReason: 'password should have at least 6 characters' },
    { validated: digitRegex.test(password), failureReason: 'password should contain a digit' },
    { validated: letterRegex.test(password), failureReason: 'password should contain a letter' },
  ];

  const validationResult = validations.find((value) => value.validated == false);
  if (validationResult) {
    return { message: 'invalid password', ...validationResult };
  } else {
    return { validated: true, message: '', failureReason: '' };
  }
}

async function validateEmail(email: string) {
  const userRepository = appDataSource.getRepository(User);
  const isDuplicated = await userRepository.exist({ where: { email } });
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (isDuplicated) {
    return {
      validated: false,
      message: 'invalid email',
      failureReason: 'an user with that email already exists',
    };
  } else if (!emailRegex.test(email)) {
    return {
      validated: false,
      message: 'invalid email',
      failureReason: 'email has invalid format',
    };
  } else {
    return { validated: true, message: '', failureReason: '' };
  }
}

export async function validateUser(userInput: UserInput) {
  let validationResult = validatePassword(userInput.password);
  if (validationResult.validated) {
    validationResult = await validateEmail(userInput.email);
  }
  return validationResult;
}
