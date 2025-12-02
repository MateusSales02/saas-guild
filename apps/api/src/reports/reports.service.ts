import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from '../events/event.entity';
import { EventParticipant } from '../events/event-participant.entity';
import { FinanceTransaction } from '../finance/finance-transaction.entity';
import { GuildMember } from '../guilds/guild-member.entity';

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  participationRate: number;
  eventsByMonth: { month: string; count: number }[];
}

export interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionsByMonth: { month: string; income: number; expenses: number }[];
  recentTransactions: FinanceTransaction[];
}

export interface MemberStats {
  totalMembers: number;
  membersByRole: { role: string; count: number }[];
  recentMembers: GuildMember[];
}

export interface GuildReport {
  events: EventStats;
  finance: FinanceStats;
  members: MemberStats;
  generatedAt: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(EventParticipant)
    private readonly participantRepo: Repository<EventParticipant>,
    @InjectRepository(FinanceTransaction)
    private readonly financeRepo: Repository<FinanceTransaction>,
    @InjectRepository(GuildMember)
    private readonly memberRepo: Repository<GuildMember>,
  ) {}

  /**
   * Gera relatório completo da guilda
   */
  async getGuildReport(guildId: number): Promise<GuildReport> {
    const [events, finance, members] = await Promise.all([
      this.getEventStats(guildId),
      this.getFinanceStats(guildId),
      this.getMemberStats(guildId),
    ]);

    return {
      events,
      finance,
      members,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Estatísticas de eventos da guilda
   */
  async getEventStats(guildId: number): Promise<EventStats> {
    const now = new Date();

    // Total de eventos
    const totalEvents = await this.eventRepo.count({
      where: { guild: { id: guildId } },
    });

    // Eventos futuros
    const upcomingEvents = await this.eventRepo
      .createQueryBuilder('e')
      .where('e.guild_id = :guildId', { guildId })
      .andWhere('e.event_date > :now', { now })
      .getCount();

    // Eventos passados
    const pastEvents = totalEvents - upcomingEvents;

    // Taxa de participação (confirmados / total de convites)
    const participationData = await this.participantRepo
      .createQueryBuilder('p')
      .innerJoin('p.event', 'e')
      .where('e.guild_id = :guildId', { guildId })
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.status')
      .getRawMany<{ status: string; count: string }>();

    const confirmed = Number(
      participationData.find((p) => p.status === 'confirmed')?.count ?? 0,
    );
    const total = participationData.reduce(
      (sum, p) => sum + Number(p.count),
      0,
    );
    const participationRate = total > 0 ? (confirmed / total) * 100 : 0;

    // Eventos por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const eventsByMonth = await this.eventRepo
      .createQueryBuilder('e')
      .where('e.guild_id = :guildId', { guildId })
      .andWhere('e.event_date >= :sixMonthsAgo', { sixMonthsAgo })
      .select("TO_CHAR(e.event_date, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .groupBy("TO_CHAR(e.event_date, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; count: string }>();

    return {
      totalEvents,
      upcomingEvents,
      pastEvents,
      participationRate: Math.round(participationRate * 100) / 100,
      eventsByMonth: eventsByMonth.map((e) => ({
        month: e.month,
        count: Number(e.count),
      })),
    };
  }

  /**
   * Estatísticas financeiras da guilda
   */
  async getFinanceStats(guildId: number): Promise<FinanceStats> {
    // Totais
    const totals = await this.financeRepo
      .createQueryBuilder('t')
      .where('t.guild_id = :guildId', { guildId })
      .select('t.type', 'type')
      .addSelect('COALESCE(SUM(t.amount), 0)', 'total')
      .groupBy('t.type')
      .getRawMany<{ type: 'in' | 'out'; total: string }>();

    const totalIncome = Number(totals.find((t) => t.type === 'in')?.total ?? 0);
    const totalExpenses = Number(
      totals.find((t) => t.type === 'out')?.total ?? 0,
    );
    const balance = totalIncome - totalExpenses;

    // Transações por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const byMonth = await this.financeRepo
      .createQueryBuilder('t')
      .where('t.guild_id = :guildId', { guildId })
      .andWhere('t.created_at >= :sixMonthsAgo', { sixMonthsAgo })
      .select("TO_CHAR(t.created_at, 'YYYY-MM')", 'month')
      .addSelect('t.type', 'type')
      .addSelect('COALESCE(SUM(t.amount), 0)', 'total')
      .groupBy("TO_CHAR(t.created_at, 'YYYY-MM')")
      .addGroupBy('t.type')
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; type: 'in' | 'out'; total: string }>();

    // Agrupa por mês
    const monthMap = new Map<string, { income: number; expenses: number }>();
    for (const row of byMonth) {
      if (!monthMap.has(row.month)) {
        monthMap.set(row.month, { income: 0, expenses: 0 });
      }
      const entry = monthMap.get(row.month)!;
      if (row.type === 'in') {
        entry.income = Number(row.total);
      } else {
        entry.expenses = Number(row.total);
      }
    }

    const transactionsByMonth = Array.from(monthMap.entries()).map(
      ([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
      }),
    );

    // Últimas 10 transações
    const recentTransactions = await this.financeRepo.find({
      where: { guild: { id: guildId } },
      order: { created_at: 'DESC' },
      take: 10,
    });

    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionsByMonth,
      recentTransactions,
    };
  }

  /**
   * Estatísticas de membros da guilda
   */
  async getMemberStats(guildId: number): Promise<MemberStats> {
    // Total de membros
    const totalMembers = await this.memberRepo.count({
      where: { guild: { id: guildId } },
    });

    // Membros por cargo
    const membersByRole = await this.memberRepo
      .createQueryBuilder('m')
      .where('m.guild_id = :guildId', { guildId })
      .select('m.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('m.role')
      .getRawMany<{ role: string; count: string }>();

    // Últimos 10 membros adicionados
    const recentMembers = await this.memberRepo.find({
      where: { guild: { id: guildId } },
      relations: ['user'],
      order: { id: 'DESC' },
      take: 10,
    });

    return {
      totalMembers,
      membersByRole: membersByRole.map((m) => ({
        role: m.role,
        count: Number(m.count),
      })),
      recentMembers,
    };
  }
}
