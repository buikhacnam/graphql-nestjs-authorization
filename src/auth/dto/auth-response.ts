import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class UserInfo {
  @Field()
  id: string;

  @Field()
  email: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  tokenId: string;

  @Field(() => UserInfo)
  userInfo: UserInfo;
}
