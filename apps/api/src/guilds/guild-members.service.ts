import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuildMember } from './guild-member.entity';
import { User } from '../users/user.entity';
import { Guild } from './guild.entity';

@Injectable()
export class GuildMembersService {
  constructor(
    @InjectRepository(GuildMember)
    private guildMembersRepository: Repository<GuildMember>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Guild)
    private guildsRepository: Repository<Guild>,
  ) {}

  findAll(): Promise<GuildMember[]> {
    return this.guildMembersRepository.find();
  }

  findOne(id: number): Promise<GuildMember | null> {
    return this.guildMembersRepository.findOneBy({ id });
  }

  async create(data: {
    userId: number;
    guildId: number;
    role: string;
  }): Promise<GuildMember> {
    const user = await this.usersRepository.findOneBy({ id: data.userId });
    const guild = await this.guildsRepository.findOneBy({ id: data.guildId });

    if (!user || !guild) {
      throw new Error('User or Guild not found');
    }

    const member = this.guildMembersRepository.create({
      user,
      guild,
      role: data.role,
    });

    return this.guildMembersRepository.save(member);
  }

  async update(
    id: number,
    memberData: Partial<GuildMember>,
  ): Promise<GuildMember | null> {
    await this.guildMembersRepository.update(id, memberData);
    return this.guildMembersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.guildMembersRepository.delete(id);
  }
}
