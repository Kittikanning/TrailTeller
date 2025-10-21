import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, User } from 'generated/prisma';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users?skip=0&take=10
  @Get()
  async getUsers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: number,
  ): Promise<User[]> {
    return this.usersService.users({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  // GET /users/:id
  @Get(':id')
  async getUser(@Param('id') id: number): Promise<User | null> {
    return this.usersService.user({ id });
  }

  // POST /users
  @Post()
  async createUser(@Body() data: Prisma.UserCreateInput): Promise<User> {
    return this.usersService.createUser(data);
  }

  // PATCH /users/:id
  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.usersService.updateUser({
      where: { id },
      data,
    });
  }

  // DELETE /users/:id
  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<User> {
    return this.usersService.deleteUser({ id });
  }
}
