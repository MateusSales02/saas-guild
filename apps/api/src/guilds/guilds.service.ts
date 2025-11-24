import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Guild } from './guild.entity';
import { GuildMember } from './guild-member.entity';

@Injectable()
export class GuildsService {
  constructor(
    @InjectRepository(Guild)
    private readonly guildsRepository: Repository<Guild>,

    @InjectRepository(GuildMember)
    private readonly gmRepository: Repository<GuildMember>,
  ) {}

  findAll(): Promise<Guild[]> {
    return this.guildsRepository.find();
  }

  findOne(id: number): Promise<Guild | null> {
    return this.guildsRepository.findOne({ where: { id } });
  }

  async create(guildData: Partial<Guild>): Promise<Guild> {
    const guild = this.guildsRepository.create(guildData);
    return this.guildsRepository.save(guild);
  }

  async update(id: number, guildData: Partial<Guild>): Promise<Guild | null> {
    await this.guildsRepository.update(id, guildData);
    return this.guildsRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.guildsRepository.delete(id);
  }

  async findByMember(userId: number): Promise<Guild[]> {
    const rows = await this.gmRepository.find({
      where: { user: { id: userId } },
      relations: ['guild'],
      order: { id: 'ASC' },
    });

    return rows.map((r): Guild => r.guild);
  }

  /**
   * Cria uma guilda e associa o usuário como líder
   */
  async createGuildWithLeader(
    userId: number,
    guildName: string,
  ): Promise<Guild> {
    // Cria a guilda
    const guild = this.guildsRepository.create({ name: guildName });
    const savedGuild = await this.guildsRepository.save(guild);

    // Associa o usuário como líder da guilda
    const guildMember = this.gmRepository.create({
      user: { id: userId },
      guild: savedGuild,
      role: 'líder',
    });
    await this.gmRepository.save(guildMember);

    return savedGuild;
  }
}
