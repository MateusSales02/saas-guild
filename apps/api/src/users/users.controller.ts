// apps/api/src/users/users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { PublicUser } from './users.types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/search?q=texto  -> busca por email ou nickname
  @Get('search')
  async search(@Query('q') q = ''): Promise<PublicUser[]> {
    // assumindo que o service já retorna PublicUser[]
    return await this.usersService.search(q);
  }

  @Get()
  async findAll(): Promise<PublicUser[]> {
    // assumindo que o service já retorna PublicUser[]
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PublicUser | null> {
    // assumindo que o service já retorna PublicUser | null
    return await this.usersService.findOne(Number(id));
  }

  @Post()
  async create(@Body() userData: Partial<User>): Promise<PublicUser> {
    // assumindo que o service cria e já devolve PublicUser
    return await this.usersService.create(userData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() userData: Partial<User>,
  ): Promise<PublicUser | null> {
    // assumindo que o service atualiza e já devolve PublicUser | null
    return await this.usersService.update(Number(id), userData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    await this.usersService.remove(Number(id));
    return { deleted: true };
  }
}
