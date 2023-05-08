import { User } from './entity/user';

function validatePassword(password: string) {
  const digitRegex = /[0-9]/;
  const letterRegex = /[a-z|A-Z]/;
  return password.length > 5 && digitRegex.test(password) && letterRegex.test(password);
}

async function validateEmail(email: string) {
  const userRepository = User.getRepository();
  const isDuplicated = await userRepository.exist({ where: { email } });
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return !isDuplicated && emailRegex.test(email);
}

export async function validateUser(user: User) {
  let validated = true;
  let failureReason = '';

  if (!validatePassword(user.password)) {
    validated = false;
    failureReason = 'Invalid Password';
  } else if (!(await validateEmail(user.email))) {
    validated = false;
    failureReason = 'Invalid Email';
  }
  return { validated, failureReason };
}
