import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { GuildsService } from './guilds.service';
import { Guild } from './guild.entity';

type AuthedRequest = Request & { user?: { sub?: number } };

@Controller('guilds')
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  // Minhas guildas (precisa de JWT)
  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async my(@Req() req: AuthedRequest): Promise<Guild[]> {
    const userId = Number(req.user?.sub);
    return this.guildsService.findByMember(userId);
  }

  @Get()
  async findAll(): Promise<Guild[]> {
    return this.guildsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Guild | null> {
    return this.guildsService.findOne(Number(id));
  }

  @Post()
  async create(@Body() guildData: Partial<Guild>): Promise<Guild> {
    return this.guildsService.create(guildData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() guildData: Partial<Guild>,
  ): Promise<Guild | null> {
    return this.guildsService.update(Number(id), guildData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    await this.guildsService.remove(Number(id));
    return { deleted: true };
  }
}
