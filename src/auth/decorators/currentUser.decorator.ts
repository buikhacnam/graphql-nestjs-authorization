import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RefreshTokenPayload } from '../types/types';
export const CurrentUser = createParamDecorator(
  (_data: keyof RefreshTokenPayload | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    if (_data) {
      return req.user[_data];
    }
    return req.user;
  },
);
