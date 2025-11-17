import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanceTransaction } from './finance-transaction.entity';
import { Guild } from '../guilds/guild.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceTransaction)
    private repo: Repository<FinanceTransaction>,
    @InjectRepository(Guild) private guilds: Repository<Guild>,
  ) {}

  async create(dto: CreateTransactionDto) {
    const guild = await this.guilds.findOne({ where: { id: dto.guildId } });
    if (!guild) throw new NotFoundException('Guild não encontrada');

    const tx = this.repo.create({
      guild,
      type: dto.type,
      amount: dto.amount,
      note: dto.note,
    });
    return this.repo.save(tx);
  }

  listByGuild(guildId: number) {
    return this.repo.find({
      where: { guild: { id: guildId } },
      order: { created_at: 'DESC' },
    });
  }

  async summary(guildId: number) {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('COALESCE(SUM(t.amount),0)', 'total')
      .where('t.guild_id = :guildId', { guildId })
      .groupBy('t.type')
      .getRawMany<{ type: 'in' | 'out'; total: string }>();

    const totalIn = Number(rows.find((r) => r.type === 'in')?.total ?? 0);
    const totalOut = Number(rows.find((r) => r.type === 'out')?.total ?? 0);
    return { totalIn, totalOut, balance: totalIn - totalOut };
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { ok: true };
  }
}
