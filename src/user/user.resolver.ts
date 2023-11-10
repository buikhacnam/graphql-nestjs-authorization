import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import {
  Permission,
  Permissions,
} from '../auth/decorators/permissions.decorator';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Permissions(Permission.GENERAL_ADMIN_PERMISSION)
  @Query(() => [User], { name: 'findAllUser' })
  findAll() {
    return this.userService.findAll();
  }

  @Permissions(Permission.GENERAL_USER_PERMISSION)
  @Query(() => User, { name: 'me' })
  findOne(@CurrentUser('sub') userId: string) {
    return this.userService.findOne(userId);
  }

  @Permissions(Permission.GENERAL_USER_PERMISSION)
  @Mutation(() => User)
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser('sub') userId: string,
  ) {
    return this.userService.update(userId, updateUserInput);
  }

  @Permissions(Permission.BLOCK_USER)
  @Mutation(() => String)
  blockUser(@Args('email') email: string) {
    return this.userService.block(email);
  }
}
