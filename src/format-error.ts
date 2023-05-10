import { unwrapResolverError } from '@apollo/server/errors';
import { GraphQLFormattedError } from 'graphql';
import { BaseError } from './base-error';

export function formatError(formattedError: GraphQLFormattedError, error: unknown) {
  const unwrappedError = unwrapResolverError(error);

  if (unwrappedError instanceof BaseError) {
    return { ...unwrappedError, stackframe: process.env.SHOW_STACK_IN_ERRORS == 'yes' ? unwrappedError.stack : '' };
  }

  return new BaseError('Unknown error', 500, '');
}
