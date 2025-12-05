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
    await this.repo.softDelete(id);
    return { ok: true };
  }

  async findDeleted() {
    return this.repo
      .find({
        where: {},
        withDeleted: true,
      })
      .then((transactions) =>
        transactions.filter((t) => t.deleted_at !== null),
      );
  }

  async restore(id: number) {
    await this.repo.restore(id);
    return { restored: true };
  }

  async hardRemove(id: number) {
    const transaction = await this.repo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!transaction) throw new NotFoundException('Transação não encontrada');
    await this.repo.remove(transaction);
    return { deleted: true };
  }

  async dailyHistory(guildId: number, days: number) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const transactions = await this.repo
      .createQueryBuilder('t')
      .select('DATE(t.created_at)', 'date')
      .addSelect('t.type', 'type')
      .addSelect('COALESCE(SUM(t.amount),0)', 'amount')
      .where('t.guild_id = :guildId', { guildId })
      .andWhere('t.created_at >= :start', { start })
      .groupBy('DATE(t.created_at), t.type')
      .orderBy('DATE(t.created_at)', 'ASC')
      .getRawMany<{ date: string; type: 'in' | 'out'; amount: string }>();

    const dailyBalances: Array<{ date: string; balance: number }> = [];
    let currentBalance = 0;

    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);

      const dayTransactions = transactions.filter((t) => {
        const tDateStr =
          typeof t.date === 'string'
            ? t.date
            : (t.date as Date).toISOString();
        return tDateStr.slice(0, 10) === dateKey;
      });
      const dayIn = Number(
        dayTransactions.find((t) => t.type === 'in')?.amount ?? 0,
      );
      const dayOut = Number(
        dayTransactions.find((t) => t.type === 'out')?.amount ?? 0,
      );

      currentBalance += dayIn - dayOut;
      dailyBalances.push({ date: dateKey, balance: currentBalance });
    }

    return dailyBalances;
  }
}
