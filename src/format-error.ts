import { unwrapResolverError } from '@apollo/server/errors';
import { GraphQLFormattedError } from 'graphql';
import { BaseError } from 'src/base-error';

function wrapError(error: BaseError) {
  return {
    ...error,
    stacktrace: process.env.SHOW_STACK_IN_ERRORS == 'yes' ? error.stack : undefined,
  };
}

export function formatError(e: GraphQLFormattedError, error: unknown) {
  const unwrappedError = unwrapResolverError(error);

  if (unwrappedError instanceof BaseError) {
    return wrapError(unwrappedError);
  }

  return wrapError(new BaseError('Unknown error', 500, ''));
}
