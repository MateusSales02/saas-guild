import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  OperationsService,
  decorate,
  summarize,
  totalsFromEntries,
} from './operations.service';
import { FinanceOperation } from './finance-operation.entity';
import { FinanceOperationEntry } from './finance-operation-entry.entity';
import { FinanceTransaction } from './finance-transaction.entity';
import { Guild } from '../guilds/guild.entity';
import { User } from '../users/user.entity';

const guild = { id: 1, name: 'Guilda' } as Guild;

function op(partial: Partial<FinanceOperation> = {}): FinanceOperation {
  return {
    id: 1,
    guild,
    title: 'Couro T5',
    category: 'refine',
    quantity: 1000,
    cost: 1_000_000,
    fees: 50_000,
    fee_rate: 0,
    market_tax: 0,
    expected_revenue: 1_500_000,
    actual_revenue: 0,
    sold_quantity: 0,
    status: 'open',
    purchased_at: new Date('2026-10-01T12:00:00'),
    sold_at: null,
    note: null,
    created_by_id: null,
    created_by_name: null,
    created_at: new Date('2026-10-01T12:00:00'),
    updated_at: new Date('2026-10-01T12:00:00'),
    ...partial,
  };
}

function entry(
  partial: Partial<FinanceOperationEntry> = {},
): FinanceOperationEntry {
  return {
    id: 1,
    operation: op(),
    kind: 'sale',
    amount: 100,
    tax: 0,
    quantity: null,
    note: null,
    occurred_at: new Date(),
    tx_id: null,
    created_by_name: null,
    created_at: new Date(),
    ...partial,
  };
}

describe('decorate', () => {
  it('mostra o saldo parcial e deixa o lucro real vazio enquanto aberta', () => {
    const v = decorate(op({ actual_revenue: 400_000 }));
    expect(v.total_cost).toBe(1_050_000);
    expect(v.received).toBe(400_000);
    expect(v.balance).toBe(-650_000);
    expect(v.expected_profit).toBe(450_000);
    expect(v.actual_profit).toBeNull();
    expect(v.variance).toBeNull();
  });

  it('calcula lucro real e a diferença quando encerrada', () => {
    const v = decorate(op({ status: 'sold', actual_revenue: 1_300_000 }));
    expect(v.actual_profit).toBe(250_000);
    expect(v.variance).toBe(-200_000);
  });

  it('desconta a taxa do mercado da venda esperada', () => {
    const v = decorate(op({ fee_rate: 6.5 }));
    expect(v.expected_net).toBe(1_402_500);
    expect(v.expected_profit).toBe(352_500);
  });

  it('trata perdida sem vendas como prejuízo total', () => {
    const v = decorate(op({ status: 'cancelled', actual_revenue: null }));
    expect(v.actual_profit).toBe(-1_050_000);
  });
});

describe('totalsFromEntries', () => {
  it('separa compras, taxas e vendas parciais', () => {
    expect(
      totalsFromEntries([
        entry({ kind: 'purchase', amount: 1_000 }),
        entry({ kind: 'purchase', amount: 500 }),
        entry({ kind: 'fee', amount: 80 }),
        entry({ kind: 'sale', amount: 700, quantity: 300 }),
        entry({ kind: 'sale', amount: 900, quantity: 400, tax: 60 }),
      ]),
    ).toEqual({
      cost: 1_500,
      fees: 80,
      actual_revenue: 1_540,
      market_tax: 60,
      sold_quantity: 700,
    });
  });
});

describe('summarize', () => {
  const now = new Date('2026-10-15T12:00:00');

  it('agrega totais, acerto, ROI e taxa de sucesso', () => {
    const s = summarize(
      [
        op({ id: 1, actual_revenue: 200_000 }),
        op({
          id: 2,
          status: 'sold',
          actual_revenue: 1_500_000,
          sold_at: new Date('2026-10-10'),
        }),
        op({
          id: 3,
          status: 'sold',
          actual_revenue: 900_000,
          category: 'craft',
          sold_at: new Date('2026-09-10'),
        }),
      ],
      now,
    );

    expect(s.counts).toEqual({ total: 3, open: 1, sold: 2, cancelled: 0 });
    expect(s.invested).toBe(3_150_000);
    expect(s.openCapital).toBe(1_050_000);
    expect(s.openReceived).toBe(200_000);
    expect(s.closedExpectedProfit).toBe(900_000);
    expect(s.realizedProfit).toBe(450_000 - 150_000);
    expect(s.accuracy).toBeCloseTo(300_000 / 900_000);
    expect(s.roi).toBeCloseTo(300_000 / 2_100_000);
    expect(s.winRate).toBe(0.5);
    expect(s.byCategory.map((c) => c.category)).toEqual(['craft', 'refine']);
    expect(s.monthly).toHaveLength(6);
    expect(s.monthly[5]).toMatchObject({
      month: '2026-10',
      count: 1,
      realizedProfit: 450_000,
    });
    expect(s.monthly[4]).toMatchObject({
      month: '2026-09',
      realizedProfit: -150_000,
    });
  });

  it('retorna indicadores nulos sem operações encerradas', () => {
    const s = summarize([], now);
    expect(s.accuracy).toBeNull();
    expect(s.roi).toBeNull();
    expect(s.winRate).toBeNull();
    expect(s.byCategory).toEqual([]);
  });
});

describe('OperationsService', () => {
  let service: OperationsService;
  let repo: Record<string, jest.Mock>;
  let entries: Record<string, jest.Mock>;
  let txRepo: Record<string, jest.Mock>;
  let guilds: Record<string, jest.Mock>;
  let saved: FinanceOperationEntry[];

  beforeEach(async () => {
    saved = [];
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((v: unknown) => v),
      save: jest.fn((v: object) => Promise.resolve({ id: 1, ...v })),
      softDelete: jest.fn(),
    };
    entries = {
      create: jest.fn((v: unknown) => v),
      save: jest.fn((v: FinanceOperationEntry) => {
        const e = { ...v, id: saved.length + 1 };
        saved.push(e);
        return Promise.resolve(e);
      }),
      find: jest.fn(() => Promise.resolve(saved)),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    txRepo = {
      create: jest.fn((v: unknown) => v),
      save: jest.fn((v: object) => Promise.resolve({ id: 99, ...v })),
      softDelete: jest.fn(),
    };
    guilds = { findOne: jest.fn().mockResolvedValue(guild) };
    const users = {
      findOne: jest.fn().mockResolvedValue({ id: 7, nickname: 'Tesoureiro' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperationsService,
        { provide: getRepositoryToken(FinanceOperation), useValue: repo },
        {
          provide: getRepositoryToken(FinanceOperationEntry),
          useValue: entries,
        },
        { provide: getRepositoryToken(FinanceTransaction), useValue: txRepo },
        { provide: getRepositoryToken(Guild), useValue: guilds },
        { provide: getRepositoryToken(User), useValue: users },
      ],
    }).compile();

    service = module.get(OperationsService);
  });

  describe('create', () => {
    const dto = {
      guildId: 1,
      title: ' Couro T5 ',
      quantity: 1000,
      cost: 1_000,
      feeRate: 5,
      expectedRevenue: 2_000,
    };

    it('cria a operação com a compra como movimento e guarda a taxa', async () => {
      const result = await service.create(dto, 7);
      expect(saved.map((e) => [e.kind, e.amount, e.quantity])).toEqual([
        ['purchase', 1_000, 1000],
      ]);
      expect(result).toMatchObject({
        title: 'Couro T5',
        status: 'open',
        created_by_name: 'Tesoureiro',
        cost: 1_000,
        fees: 0,
        fee_rate: 5,
        expected_profit: 900,
      });
      expect(txRepo.save).not.toHaveBeenCalled();
    });

    it('espelha a compra como saída na tesouraria', async () => {
      await service.create({ ...dto, syncTreasury: true });
      expect(txRepo.create).toHaveBeenCalledWith({
        guild,
        type: 'out',
        amount: 1_000,
        note: 'Compra: Couro T5',
      });
      expect(saved.every((e) => e.tx_id === 99)).toBe(true);
    });

    it('recusa valores acima do limite da tesouraria', async () => {
      await expect(
        service.create({ ...dto, cost: 3_000_000_000, syncTreasury: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('falha quando a guilda não existe', async () => {
      guilds.findOne.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addEntry', () => {
    it('soma vendas parciais e lança entrada na tesouraria', async () => {
      repo.findOne.mockResolvedValue(op());
      saved.push(entry({ kind: 'purchase', amount: 1_000_000 }));
      await service.addEntry(1, {
        kind: 'sale',
        amount: 400_000,
        quantity: 300,
      });
      const result = await service.addEntry(1, {
        kind: 'sale',
        amount: 500_000,
        quantity: 400,
        note: 'lote 2',
        syncTreasury: true,
      });
      expect(result).toMatchObject({
        cost: 1_000_000,
        actual_revenue: 900_000,
        sold_quantity: 700,
        balance: -100_000,
      });
      expect(txRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'in',
          amount: 500_000,
          note: 'Venda: Couro T5 (lote 2)',
        }),
      );
    });

    it('desconta a taxa do mercado de cada venda', async () => {
      repo.findOne.mockResolvedValue(op({ fee_rate: 6.5 }));
      const result = await service.addEntry(1, {
        kind: 'sale',
        amount: 200_000,
        syncTreasury: true,
      });
      expect(saved[0]).toMatchObject({ amount: 200_000, tax: 13_000 });
      expect(result).toMatchObject({
        actual_revenue: 187_000,
        market_tax: 13_000,
      });
      expect(txRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'in', amount: 187_000 }),
      );
    });

    it('não aceita movimentos em operação encerrada', async () => {
      repo.findOne.mockResolvedValue(op({ status: 'sold' }));
      await expect(
        service.addEntry(1, { kind: 'sale', amount: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeEntry', () => {
    it('apaga o movimento, o lançamento vinculado e recalcula', async () => {
      repo.findOne.mockResolvedValue(op());
      entries.findOne.mockResolvedValue(entry({ id: 3, tx_id: 8 }));
      await service.removeEntry(1, 3);
      expect(txRepo.softDelete).toHaveBeenCalledWith(8);
      expect(entries.delete).toHaveBeenCalledWith(3);
      expect(repo.save).toHaveBeenCalled();
    });

    it('lança 404 para movimento de outra operação', async () => {
      repo.findOne.mockResolvedValue(op());
      entries.findOne.mockResolvedValue(null);
      await expect(service.removeEntry(1, 3)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('close / reopen', () => {
    it('encerra como vendida com o lucro das vendas acumuladas', async () => {
      repo.findOne.mockResolvedValue(op({ actual_revenue: 1_400_000 }));
      const result = await service.close(1, 'sold');
      expect(result.status).toBe('sold');
      expect(result.sold_at).toBeInstanceOf(Date);
      expect(result.actual_profit).toBe(350_000);
    });

    it('não encerra duas vezes', async () => {
      repo.findOne.mockResolvedValue(op({ status: 'cancelled' }));
      await expect(service.close(1, 'sold')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('reabre mantendo os movimentos', async () => {
      repo.findOne.mockResolvedValue(
        op({ status: 'sold', sold_at: new Date() }),
      );
      saved.push(entry());
      const result = await service.reopen(1);
      expect(result).toMatchObject({ status: 'open', sold_at: null });
      expect(result.entries).toHaveLength(1);
    });
  });

  it('update altera só os dados descritivos', async () => {
    repo.findOne.mockResolvedValue(op());
    const result = await service.update(1, {
      title: 'Couro T5 → T6',
      expectedRevenue: 2_000_000,
    });
    expect(result.title).toBe('Couro T5 → T6');
    expect(result.expected_profit).toBe(2_000_000 - 1_050_000);
  });

  it('remove apaga a operação e os lançamentos vinculados', async () => {
    repo.findOne.mockResolvedValue(op());
    entries.find.mockResolvedValue([
      entry({ tx_id: 5 }),
      entry({ tx_id: null }),
      entry({ tx_id: 6 }),
    ]);
    await expect(service.remove(1)).resolves.toEqual({ ok: true });
    expect(txRepo.softDelete).toHaveBeenCalledWith([5, 6]);
    expect(repo.softDelete).toHaveBeenCalledWith(1);
  });

  it('findOne lança 404', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });
});
