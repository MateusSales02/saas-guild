import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/event.entity';
import { FinanceTransaction } from '../finance/finance-transaction.entity';
import { GuildMember } from '../guilds/guild-member.entity';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(FinanceTransaction)
    private readonly financeRepo: Repository<FinanceTransaction>,
    @InjectRepository(GuildMember)
    private readonly memberRepo: Repository<GuildMember>,
  ) {}

  /**
   * Converte array de objetos para CSV
   */
  private toCSV(data: Record<string, unknown>[], columns: string[]): string {
    if (data.length === 0) {
      return columns.join(',') + '\n';
    }

    const header = columns.join(',');
    const rows = data.map((row) =>
      columns
        .map((col) => {
          const value = row[col];
          if (value === null || value === undefined) return '';
          const str = String(value);
          // Escapa aspas e valores com vírgula
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(','),
    );

    return [header, ...rows].join('\n');
  }

  /**
   * RF12 - Exporta membros da guilda para CSV
   */
  async exportMembers(guildId: number): Promise<string> {
    const members = await this.memberRepo.find({
      where: { guild: { id: guildId } },
      relations: ['user'],
      order: { id: 'ASC' },
    });

    const data = members.map((m) => ({
      id: m.id,
      user_id: m.user?.id ?? '',
      nickname: m.user?.nickname ?? '',
      email: m.user?.email ?? '',
      role: m.role,
      joined_at: m.id, // Usando ID como proxy para data de entrada
    }));

    return this.toCSV(data, [
      'id',
      'user_id',
      'nickname',
      'email',
      'role',
      'joined_at',
    ]);
  }

  /**
   * RF12 - Exporta eventos da guilda para CSV
   */
  async exportEvents(guildId: number): Promise<string> {
    const events = await this.eventRepo.find({
      where: { guild: { id: guildId } },
      relations: ['participants', 'participants.user'],
      order: { date: 'DESC' },
    });

    const data = events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description ?? '',
      date: e.date?.toISOString() ?? '',
      type: e.type,
      location: e.location ?? '',
      participants_count: e.participants?.length ?? 0,
      confirmed_count:
        e.participants?.filter((p) => p.status === 'confirmed').length ?? 0,
    }));

    return this.toCSV(data, [
      'id',
      'title',
      'description',
      'date',
      'type',
      'location',
      'participants_count',
      'confirmed_count',
    ]);
  }

  /**
   * RF12 - Exporta transações financeiras da guilda para CSV
   */
  async exportFinance(guildId: number): Promise<string> {
    const transactions = await this.financeRepo.find({
      where: { guild: { id: guildId } },
      order: { created_at: 'DESC' },
    });

    const data = transactions.map((t) => ({
      id: t.id,
      type: t.type === 'in' ? 'Entrada' : 'Saída',
      amount: t.amount,
      note: t.note ?? '',
      created_at: t.created_at?.toISOString() ?? '',
    }));

    return this.toCSV(data, ['id', 'type', 'amount', 'note', 'created_at']);
  }

  /**
   * RF12 - Exporta relatório completo da guilda para CSV
   * Combina membros, eventos e finanças em um único arquivo
   */
  async exportFullReport(guildId: number): Promise<string> {
    const [members, events, finance] = await Promise.all([
      this.exportMembers(guildId),
      this.exportEvents(guildId),
      this.exportFinance(guildId),
    ]);

    return [
      '=== MEMBROS ===',
      members,
      '',
      '=== EVENTOS ===',
      events,
      '',
      '=== TRANSAÇÕES FINANCEIRAS ===',
      finance,
    ].join('\n');
  }
}
