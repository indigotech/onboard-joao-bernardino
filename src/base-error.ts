export class BaseError extends Error {
  constructor(public message: string, public code: number, public details: string) {
    super();
  }
}
