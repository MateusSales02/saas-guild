import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FinanceOperation,
  OPERATION_CATEGORIES,
  type OperationCategory,
} from './finance-operation.entity';
import {
  FinanceOperationEntry,
  type EntryKind,
} from './finance-operation-entry.entity';
import { FinanceTransaction } from './finance-transaction.entity';
import { Guild } from '../guilds/guild.entity';
import { User } from '../users/user.entity';
import {
  CreateEntryDto,
  CreateOperationDto,
  UpdateOperationDto,
} from './dto/operation.dto';

// finance_transactions.amount é integer
const MAX_TREASURY_AMOUNT = 2_147_483_647;

const ENTRY_LABELS: Record<EntryKind, string> = {
  purchase: 'Compra',
  fee: 'Taxa',
  sale: 'Venda',
};

export type OperationView = FinanceOperation & {
  total_cost: number;
  /** quanto já entrou nas vendas */
  received: number;
  /** recebido − gasto até agora (fica negativo até as vendas cobrirem o custo) */
  balance: number;
  /** venda esperada já sem a taxa do mercado */
  expected_net: number;
  expected_profit: number;
  actual_profit: number | null;
  /** realizado − esperado (só para operações encerradas) */
  variance: number | null;
};

type Bucket = {
  count: number;
  invested: number;
  expectedProfit: number;
  realizedProfit: number;
};

export type OperationsSummary = {
  counts: { total: number; open: number; sold: number; cancelled: number };
  invested: number;
  openCapital: number;
  /** já recebido em vendas parciais de operações ainda abertas */
  openReceived: number;
  openExpectedProfit: number;
  expectedProfit: number;
  closedExpectedProfit: number;
  realizedRevenue: number;
  realizedProfit: number;
  /** realizado / esperado das operações encerradas (1 = bateu a meta) */
  accuracy: number | null;
  /** lucro realizado / capital das operações encerradas */
  roi: number | null;
  /** fração das encerradas que deram lucro */
  winRate: number | null;
  byCategory: Array<Bucket & { category: OperationCategory }>;
  monthly: Array<{
    month: string;
    expectedProfit: number;
    realizedProfit: number;
    count: number;
  }>;
};

export function totalCost(op: Pick<FinanceOperation, 'cost' | 'fees'>) {
  return Number(op.cost) + Number(op.fees ?? 0);
}

/** Taxa do mercado sobre um valor bruto de venda */
export function marketTax(gross: number, rate: number) {
  return Math.round((gross * (Number(rate) || 0)) / 100);
}

export function expectedNet(
  op: Pick<FinanceOperation, 'expected_revenue' | 'fee_rate'>,
) {
  const gross = Number(op.expected_revenue);
  return gross - marketTax(gross, op.fee_rate);
}

export function decorate(op: FinanceOperation): OperationView {
  const cost = totalCost(op);
  const received = Number(op.actual_revenue ?? 0);
  const expected = expectedNet(op) - cost;
  const actual = op.status !== 'open' ? received - cost : null;
  return {
    ...op,
    total_cost: cost,
    received,
    balance: received - cost,
    expected_net: expectedNet(op),
    expected_profit: expected,
    actual_profit: actual,
    variance: actual === null ? null : actual - expected,
  };
}

/** Totais da operação a partir dos movimentos */
export function totalsFromEntries(entries: FinanceOperationEntry[]) {
  const sum = (kind: EntryKind, f: (e: FinanceOperationEntry) => number) =>
    entries.filter((e) => e.kind === kind).reduce((acc, e) => acc + f(e), 0);
  return {
    cost: sum('purchase', (e) => Number(e.amount)),
    fees: sum('fee', (e) => Number(e.amount)),
    actual_revenue: sum('sale', (e) => Number(e.amount) - Number(e.tax ?? 0)),
    market_tax: sum('sale', (e) => Number(e.tax ?? 0)),
    sold_quantity: sum('sale', (e) => e.quantity ?? 0),
  };
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function summarize(
  ops: FinanceOperation[],
  now = new Date(),
  months = 6,
): OperationsSummary {
  const views = ops.map(decorate);
  const open = views.filter((o) => o.status === 'open');
  const closed = views.filter((o) => o.status !== 'open');
  const sum = (list: OperationView[], f: (o: OperationView) => number) =>
    list.reduce((acc, o) => acc + f(o), 0);

  const closedCost = sum(closed, (o) => o.total_cost);
  const closedExpected = sum(closed, (o) => o.expected_profit);
  const realizedProfit = sum(closed, (o) => o.actual_profit ?? 0);

  const byCategory = OPERATION_CATEGORIES.map((category) => {
    const list = views.filter((o) => o.category === category);
    const closedList = list.filter((o) => o.status !== 'open');
    return {
      category,
      count: list.length,
      invested: sum(list, (o) => o.total_cost),
      expectedProfit: sum(closedList, (o) => o.expected_profit),
      realizedProfit: sum(closedList, (o) => o.actual_profit ?? 0),
    };
  }).filter((c) => c.count > 0);

  const monthly: OperationsSummary['monthly'] = [];
  for (let i = months - 1; i >= 0; i--) {
    const key = monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1));
    const list = closed.filter(
      (o) =>
        monthKey(new Date(o.sold_at ?? o.updated_at ?? o.purchased_at)) === key,
    );
    monthly.push({
      month: key,
      count: list.length,
      expectedProfit: sum(list, (o) => o.expected_profit),
      realizedProfit: sum(list, (o) => o.actual_profit ?? 0),
    });
  }

  return {
    counts: {
      total: views.length,
      open: open.length,
      sold: views.filter((o) => o.status === 'sold').length,
      cancelled: views.filter((o) => o.status === 'cancelled').length,
    },
    invested: sum(views, (o) => o.total_cost),
    openCapital: sum(open, (o) => o.total_cost),
    openReceived: sum(open, (o) => o.received),
    openExpectedProfit: sum(open, (o) => o.expected_profit),
    expectedProfit: sum(views, (o) => o.expected_profit),
    closedExpectedProfit: closedExpected,
    realizedRevenue: sum(closed, (o) => o.received),
    realizedProfit,
    accuracy:
      closed.length && closedExpected > 0
        ? realizedProfit / closedExpected
        : null,
    roi: closedCost > 0 ? realizedProfit / closedCost : null,
    winRate: closed.length
      ? closed.filter((o) => (o.actual_profit ?? 0) > 0).length / closed.length
      : null,
    byCategory,
    monthly,
  };
}

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(FinanceOperation)
    private repo: Repository<FinanceOperation>,
    @InjectRepository(FinanceOperationEntry)
    private entries: Repository<FinanceOperationEntry>,
    @InjectRepository(FinanceTransaction)
    private txRepo: Repository<FinanceTransaction>,
    @InjectRepository(Guild) private guilds: Repository<Guild>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  async listByGuild(guildId: number) {
    const ops = await this.repo.find({
      where: { guild: { id: guildId } },
      relations: { entries: true },
      order: {
        purchased_at: 'DESC',
        id: 'DESC',
        entries: { occurred_at: 'DESC', id: 'DESC' },
      },
    });
    return ops.map(decorate);
  }

  async summary(guildId: number) {
    const ops = await this.repo.find({ where: { guild: { id: guildId } } });
    return summarize(ops);
  }

  async findOne(id: number) {
    const op = await this.repo.findOne({
      where: { id },
      relations: { guild: true },
    });
    if (!op) throw new NotFoundException('Operação não encontrada');
    return op;
  }

  async create(dto: CreateOperationDto, userId?: number) {
    const guild = await this.guilds.findOne({ where: { id: dto.guildId } });
    if (!guild) throw new NotFoundException('Guild não encontrada');
    const author = await this.authorName(userId);

    const op = await this.repo.save(
      this.repo.create({
        guild,
        title: dto.title.trim(),
        category: dto.category ?? 'other',
        quantity: dto.quantity ?? 1,
        cost: 0,
        fees: 0,
        fee_rate: dto.feeRate ?? 0,
        market_tax: 0,
        expected_revenue: dto.expectedRevenue,
        actual_revenue: 0,
        sold_quantity: 0,
        status: 'open',
        purchased_at: dto.purchasedAt ? new Date(dto.purchasedAt) : new Date(),
        note: dto.note?.trim() || null,
        created_by_id: userId ?? null,
        created_by_name: author,
      }),
    );

    // A compra inicial vira o primeiro movimento de saída
    if (dto.cost > 0) {
      await this.saveEntry(op, author, {
        kind: 'purchase',
        amount: dto.cost,
        quantity: op.quantity,
        occurredAt: dto.purchasedAt,
        syncTreasury: dto.syncTreasury,
      });
    }

    return this.recompute(op);
  }

  async update(id: number, dto: UpdateOperationDto) {
    const op = await this.findOne(id);

    if (dto.title !== undefined) op.title = dto.title.trim();
    if (dto.category !== undefined) op.category = dto.category;
    if (dto.quantity !== undefined) op.quantity = dto.quantity;
    if (dto.expectedRevenue !== undefined)
      op.expected_revenue = dto.expectedRevenue;
    if (dto.feeRate !== undefined) op.fee_rate = dto.feeRate;
    if (dto.purchasedAt !== undefined)
      op.purchased_at = new Date(dto.purchasedAt);
    if (dto.note !== undefined) op.note = dto.note.trim() || null;

    await this.repo.save(op);
    return this.withEntries(op);
  }

  async addEntry(id: number, dto: CreateEntryDto, userId?: number) {
    const op = await this.findOne(id);
    if (op.status !== 'open') {
      throw new BadRequestException(
        'Operação encerrada. Reabra para lançar novos movimentos.',
      );
    }
    await this.saveEntry(op, await this.authorName(userId), dto);
    return this.recompute(op);
  }

  async removeEntry(id: number, entryId: number) {
    const op = await this.findOne(id);
    const entry = await this.entries.findOne({
      where: { id: entryId, operation: { id } },
    });
    if (!entry) throw new NotFoundException('Movimento não encontrado');
    if (entry.tx_id) await this.txRepo.softDelete(entry.tx_id);
    await this.entries.delete(entry.id);
    return this.recompute(op);
  }

  /** Encerra a operação: vendida (lucro realizado) ou perdida (prejuízo) */
  async close(id: number, result: 'sold' | 'cancelled') {
    const op = await this.findOne(id);
    if (op.status !== 'open') {
      throw new BadRequestException('Esta operação já foi encerrada');
    }
    op.status = result;
    op.sold_at = new Date();
    await this.repo.save(op);
    return this.withEntries(op);
  }

  /** Volta uma operação encerrada para "em aberto"; os movimentos ficam */
  async reopen(id: number) {
    const op = await this.findOne(id);
    op.status = 'open';
    op.sold_at = null;
    await this.repo.save(op);
    return this.withEntries(op);
  }

  async remove(id: number) {
    await this.findOne(id);
    const list = await this.entries.find({ where: { operation: { id } } });
    const linked = list.map((e) => e.tx_id).filter((v): v is number => !!v);
    if (linked.length) await this.txRepo.softDelete(linked);
    await this.repo.softDelete(id);
    return { ok: true };
  }

  private async authorName(userId?: number) {
    if (!userId) return null;
    const user = await this.users.findOne({ where: { id: userId } });
    return user?.nickname ?? null;
  }

  private async saveEntry(
    op: FinanceOperation,
    author: string | null,
    dto: CreateEntryDto,
  ) {
    const tax = dto.kind === 'sale' ? marketTax(dto.amount, op.fee_rate) : 0;
    const entry = this.entries.create({
      operation: op,
      kind: dto.kind,
      amount: dto.amount,
      tax,
      quantity: dto.quantity ?? null,
      note: dto.note?.trim() || null,
      occurred_at: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
      created_by_name: author,
      tx_id: null,
    });
    if (dto.syncTreasury) {
      const label = entry.note
        ? `${ENTRY_LABELS[dto.kind]}: ${op.title} (${entry.note})`
        : `${ENTRY_LABELS[dto.kind]}: ${op.title}`;
      const tx = await this.mirrorTx(
        op.guild,
        dto.kind === 'sale' ? 'in' : 'out',
        dto.amount - tax,
        label,
      );
      entry.tx_id = tx?.id ?? null;
    }
    return this.entries.save(entry);
  }

  /** Recalcula os totais da operação a partir dos movimentos e devolve a view */
  private async recompute(op: FinanceOperation) {
    const list = await this.entries.find({
      where: { operation: { id: op.id } },
      order: { occurred_at: 'DESC', id: 'DESC' },
    });
    Object.assign(op, totalsFromEntries(list));
    const saved = await this.repo.save(op);
    return decorate({ ...saved, entries: list });
  }

  private async withEntries(op: FinanceOperation) {
    const list = await this.entries.find({
      where: { operation: { id: op.id } },
      order: { occurred_at: 'DESC', id: 'DESC' },
    });
    return decorate({ ...op, entries: list });
  }

  private async mirrorTx(
    guild: Guild,
    type: 'in' | 'out',
    amount: number,
    note: string,
  ) {
    if (amount <= 0) return null;
    if (amount > MAX_TREASURY_AMOUNT) {
      throw new BadRequestException(
        'Valor alto demais para lançar na tesouraria (máx. 2,1 bilhões por lançamento)',
      );
    }
    return this.txRepo.save(
      this.txRepo.create({ guild, type, amount, note: note.slice(0, 255) }),
    );
  }
}
