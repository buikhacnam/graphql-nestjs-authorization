import { Injectable } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  private userSelect = {
    email: true,
    firstName: true,
    lastName: true,
    id: true,
  };
  constructor(private prismaService: PrismaService) {}
  findAll() {
    return this.prismaService.user.findMany({
      select: this.userSelect,
    });
  }

  findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: this.userSelect,
    });
  }

  update(id: string, updateUserInput: UpdateUserInput) {
    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        ...updateUserInput,
      },
      select: this.userSelect,
    });
  }

  block(email: string) {
    return `This action will block user with email: ${email}}`;
  }
}
