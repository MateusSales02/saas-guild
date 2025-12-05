import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceTransaction } from './finance-transaction.entity';
import { Guild } from '../guilds/guild.entity';

describe('FinanceService', () => {
  let service: FinanceService;
  let mockRepo: any;
  let mockGuildsRepo: any;

  const mockGuild: Guild = {
    id: 1,
    name: 'Test Guild',
    created_at: new Date(),
    updated_at: new Date(),
    members: [],
    events: [],
    transactions: [],
  };

  const mockTransaction: FinanceTransaction = {
    id: 1,
    guild: mockGuild,
    type: 'in',
    amount: 1000,
    note: 'Test deposit',
    created_at: new Date(),
  };

  const mockTransactions: FinanceTransaction[] = [
    mockTransaction,
    {
      ...mockTransaction,
      id: 2,
      type: 'out',
      amount: 500,
      note: 'Test withdrawal',
    },
  ];

  beforeEach(async () => {
    mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockGuildsRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        {
          provide: getRepositoryToken(FinanceTransaction),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(Guild),
          useValue: mockGuildsRepo,
        },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      guildId: 1,
      type: 'in' as const,
      amount: 1000,
      note: 'Test deposit',
    };

    it('should create a new transaction', async () => {
      mockGuildsRepo.findOne.mockResolvedValue(mockGuild);
      mockRepo.create.mockReturnValue(mockTransaction);
      mockRepo.save.mockResolvedValue(mockTransaction);

      const result = await service.create(createDto);

      expect(mockGuildsRepo.findOne).toHaveBeenCalledWith({
        where: { id: createDto.guildId },
      });
      expect(mockRepo.create).toHaveBeenCalledWith({
        guild: mockGuild,
        type: createDto.type,
        amount: createDto.amount,
        note: createDto.note,
      });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.amount).toBe(1000);
    });

    it('should throw NotFoundException if guild not found', async () => {
      mockGuildsRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Guild não encontrada',
      );
    });
  });

  describe('listByGuild', () => {
    it('should return transactions for a guild', async () => {
      mockRepo.find.mockResolvedValue(mockTransactions);

      const result = await service.listByGuild(1);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { guild: { id: 1 } },
        order: { created_at: 'DESC' },
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no transactions', async () => {
      mockRepo.find.mockResolvedValue([]);

      const result = await service.listByGuild(1);

      expect(result).toEqual([]);
    });
  });

  describe('summary', () => {
    it('should return correct summary with positive balance', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'in', total: '1000' },
          { type: 'out', total: '300' },
        ]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.summary(1);

      expect(result).toEqual({
        totalIn: 1000,
        totalOut: 300,
        balance: 700,
      });
    });

    it('should return correct summary with negative balance', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'in', total: '500' },
          { type: 'out', total: '800' },
        ]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.summary(1);

      expect(result).toEqual({
        totalIn: 500,
        totalOut: 800,
        balance: -300,
      });
    });

    it('should handle empty transactions', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.summary(1);

      expect(result).toEqual({
        totalIn: 0,
        totalOut: 0,
        balance: 0,
      });
    });

    it('should handle only income transactions', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ type: 'in', total: '5000' }]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.summary(1);

      expect(result).toEqual({
        totalIn: 5000,
        totalOut: 0,
        balance: 5000,
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a transaction', async () => {
      mockRepo.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(mockRepo.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('findDeleted', () => {
    it('should return only deleted transactions', async () => {
      const deletedTransaction = {
        ...mockTransaction,
        deleted_at: new Date(),
      };
      mockRepo.find.mockResolvedValue([deletedTransaction]);

      const result = await service.findDeleted();

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: {},
        withDeleted: true,
      });
      expect(result).toHaveLength(1);
      expect(result[0].deleted_at).toBeDefined();
    });

    it('should filter out non-deleted transactions', async () => {
      mockRepo.find.mockResolvedValue([
        { ...mockTransaction, deleted_at: new Date() },
        { ...mockTransaction, id: 2, deleted_at: null },
      ]);

      const result = await service.findDeleted();

      expect(result).toHaveLength(1);
    });
  });

  describe('restore', () => {
    it('should restore a deleted transaction', async () => {
      mockRepo.restore.mockResolvedValue({ affected: 1 });

      const result = await service.restore(1);

      expect(mockRepo.restore).toHaveBeenCalledWith(1);
      expect(result).toEqual({ restored: true });
    });
  });

  describe('hardRemove', () => {
    it('should permanently delete a transaction', async () => {
      mockRepo.findOne.mockResolvedValue(mockTransaction);
      mockRepo.remove.mockResolvedValue(mockTransaction);

      const result = await service.hardRemove(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true,
      });
      expect(mockRepo.remove).toHaveBeenCalledWith(mockTransaction);
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException if transaction not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.hardRemove(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.hardRemove(999)).rejects.toThrow(
        'Transação não encontrada',
      );
    });
  });

  describe('dailyHistory', () => {
    it('should return daily balance history', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { date: '2025-01-01', type: 'in', amount: '1000' },
          { date: '2025-01-01', type: 'out', amount: '200' },
          { date: '2025-01-02', type: 'in', amount: '500' },
        ]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.dailyHistory(1, 3);

      expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('t');
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('balance');
    });

    it('should handle days with no transactions', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.dailyHistory(1, 7);

      expect(result).toHaveLength(7);
      expect(result[0].balance).toBe(0);
    });
  });
});
