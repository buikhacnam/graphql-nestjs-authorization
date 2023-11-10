import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignInInput } from './dto/signin-input';
import { SignUpInput } from './dto/singup-input';
import { AuthResponse } from './dto/auth-response';
import { LogoutResponse } from './dto/logout-response';
import { CurrentUser } from './decorators/currentUser.decorator';
import { UseGuards } from '@nestjs/common';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { RefreshTokenPayload } from 'src/auth/types/types';
import { Permission, Permissions } from './decorators/permissions.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}
  @Mutation(() => AuthResponse)
  signup(@Args('signUpInput') signUpInput: SignUpInput) {
    return this.authService.signUp(signUpInput);
  }
  @Mutation(() => AuthResponse)
  signin(@Args('signInInput') signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }

  @Mutation(() => LogoutResponse)
  signout(@Args('tokenId') tokenId: string) {
    return this.authService.signOut(tokenId);
  }

  @UseGuards(RefreshTokenGuard)
  @Mutation(() => AuthResponse)
  getRefreshToken(@CurrentUser() user: RefreshTokenPayload) {
    return this.authService.getNewTokens(user.refreshToken, user.tokenId, {
      email: user.email,
      sub: user.sub,
      iat: user.iat,
      permissions: user.permissions,
    });
  }

  // No permissions required -> public
  @Query(() => String)
  public() {
    return 'hello! This query is public!';
  }

  // Only users with the GENERAL_ADMIN_PERMISSION can query this
  @Permissions(Permission.GENERAL_ADMIN_PERMISSION)
  @Query(() => String)
  adminCanQuery() {
    return 'hello admin!';
  }

  // Both users with the GENERAL_ADMIN_PERMISSION and GENERAL_USER_PERMISSION can query this
  @Permissions(
    Permission.GENERAL_ADMIN_PERMISSION,
    Permission.GENERAL_USER_PERMISSION,
  )
  @Query(() => String)
  adminAndUserCanQuery() {
    return 'hello admin and user!';
  }
}
