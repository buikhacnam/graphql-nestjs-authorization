import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()], // you can use this to set permissions on both the resolver and the query/mutation
    );

    console.log(
      'required permissions: ',
      requiredPermissions ?? 'no permissions required',
    );

    //if there is no permissions decorator, then it is public
    if (!requiredPermissions) {
      return true;
    }

    //add permissions to request object
    const req = this.getRequest(context);
    req.permissions = requiredPermissions;

    return super.canActivate(context);
  }
}
