import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { GuildMembersService } from './guild-members.service';
import { GuildMember } from './guild-member.entity';

@Controller('guild-members')
export class GuildMembersController {
  constructor(private readonly guildMembersService: GuildMembersService) {}

  @Get()
  async findAll(): Promise<GuildMember[]> {
    return this.guildMembersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GuildMember | null> {
    return this.guildMembersService.findOne(Number(id));
  }

  @Post()
  async create(
    @Body() data: { userId: number; guildId: number; role: string },
  ): Promise<GuildMember> {
    return this.guildMembersService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() memberData: Partial<GuildMember>,
  ): Promise<GuildMember | null> {
    return this.guildMembersService.update(Number(id), memberData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    await this.guildMembersService.remove(Number(id));
    return { deleted: true };
  }
}
