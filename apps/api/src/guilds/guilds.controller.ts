import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GuildsService } from './guilds.service';
import { Guild } from './guild.entity';
import { CreateGuildDto } from './dto/create-guild.dto';
import { UpdateGuildDto } from './dto/update-guild.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('guilds')
@UseGuards(AuthGuard('jwt'))
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  /**
   * Lista as guildas do usuário autenticado
   */
  @Get('my')
  async my(@CurrentUser() user: JwtPayload): Promise<Guild[]> {
    return this.guildsService.findByMember(user.sub);
  }

  /**
   * Lista todas as guildas (público para visualização)
   */
  @Get()
  async findAll(): Promise<Guild[]> {
    return this.guildsService.findAll();
  }

  /**
   * Busca uma guilda por ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Guild | null> {
    return this.guildsService.findOne(id);
  }

  /**
   * Cria uma nova guilda (apenas líderes)
   */
  @UseGuards(RolesGuard)
  @Roles('leader')
  @Post()
  async create(@Body() dto: CreateGuildDto): Promise<Guild> {
    return this.guildsService.create(dto);
  }

  /**
   * Atualiza uma guilda (apenas líderes)
   */
  @UseGuards(RolesGuard)
  @Roles('leader')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGuildDto,
  ): Promise<Guild | null> {
    return this.guildsService.update(id, dto);
  }

  /**
   * Remove uma guilda (apenas líderes)
   */
  @UseGuards(RolesGuard)
  @Roles('leader')
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ deleted: boolean }> {
    await this.guildsService.remove(id);
    return { deleted: true };
  }
}
