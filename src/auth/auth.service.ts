import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { SignInInput } from './dto/signin-input';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtPayload } from 'src/auth/types/types';
import { SignUpInput } from './dto/singup-input';

const JWT_ACCESS_TOKEN_EXPIRATION_TIME = '15m';
const JWT_REFRESH_TOKEN_EXPIRATION_TIME = '1d';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(dto: SignInInput) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    if (user.password == null) {
      throw new ForbiddenException(
        'Credentilas incorrect or this email was gotten from a social account',
      );
    }
    const isMatch = await argon.verify(user.password, dto.password);

    if (!isMatch) {
      throw new ForbiddenException('Credentilas incorrect');
    }

    return await this.handeleSigin(user);
  }

  async signUp(dto: SignUpInput) {
    const password = await argon.hash(dto.password);
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          password,
          firstName: dto.firstName,
          lastName: dto.lastName,
          roleId: 2,
        },
      });

      return await this.handeleSigin(user);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw err;
    }
  }

  private async handeleSigin(user: User) {
    // get permissions:
    //permission have many to many relation with role, user have one to many relation with role
    const permissions = await this.prismaService.permission.findMany({
      where: {
        roles: {
          some: {
            id: user.roleId,
          },
        },
      },
    });

    const permissionsNames = permissions.map((p) => p.name);

    const { refreshToken } = await this.getJwtRefreshToken(
      user.id,
      user?.email,
      permissionsNames,
    );
    const { accessToken } = await this.getJwtAccessToken(
      user.id,
      user?.email,
      permissionsNames,
    );

    try {
      const hash = await argon.hash(refreshToken);
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + 1000 * 60 * 60 * 24 * 1, // 1 days
      );
      const token = await this.prismaService.token.create({
        data: {
          expiresAt,
          refreshToken: hash,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return {
        accessToken,
        refreshToken,
        tokenId: token.id,
        userInfo: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      console.log(error);
    }
  }

  async signOut(tokenId: string) {
    try {
      await this.prismaService.token.delete({
        where: {
          id: tokenId,
        },
      });
      return {
        loggedOut: true,
      };
    } catch (error) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  private async generateTokens(payload: JwtPayload, tokenId: string) {
    const { accessToken } = await this.getJwtAccessToken(
      payload.sub,
      payload.email,
    );

    const { refreshToken: newRefreshToken } = await this.getJwtRefreshToken(
      payload.sub,
      payload.email,
    );

    const hash = await argon.hash(newRefreshToken);

    await this.prismaService.token.update({
      where: {
        id: tokenId,
      },
      data: {
        refreshToken: hash,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      tokenId: tokenId,
      userInfo: {
        id: payload.sub,
        email: payload.email,
      },
    };
  }

  private async getJwtRefreshToken(
    sub: string,
    email: string,
    permissions?: string[],
  ) {
    const payload = { sub, email, permissions };
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });
    return {
      refreshToken,
    };
  }

  private async getJwtAccessToken(
    sub: string,
    email?: string,
    permissions?: string[],
  ) {
    const payload = { sub, email, permissions };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    return {
      accessToken,
    };
  }

  async getNewTokens(
    refreshToken: string,
    tokenId: string,
    payload: JwtPayload,
  ) {
    const foundToken = await this.prismaService.token.findUnique({
      where: {
        id: tokenId,
      },
    });

    if (foundToken == null) {
      console.log('refresh token not found');
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await argon.verify(
      foundToken.refreshToken ?? '',
      refreshToken,
    );

    if (isMatch) {
      return await this.generateTokens(payload, tokenId);
    } else {
      await this.prismaService.token.delete({
        where: {
          id: tokenId,
        },
      });
      console.log('invalid refresh token');
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
