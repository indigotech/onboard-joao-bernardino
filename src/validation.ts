export function isValidPassword(password: string): boolean {
  const digitRegex = /[0-9]/;
  const letterRegex = /[a-z]/;
  return password.length > 5 && digitRegex.test(password) && letterRegex.test(password);
}
