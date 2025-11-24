import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { Event } from '../events/event.entity';
import { EventParticipant } from '../events/event-participant.entity';
import { FinanceTransaction } from '../finance/finance-transaction.entity';
import { GuildMember } from '../guilds/guild-member.entity';

describe('ReportsService', () => {
  let service: ReportsService;
  let mockEventRepo: any;
  let mockParticipantRepo: any;
  let mockFinanceRepo: any;
  let mockMemberRepo: any;

  beforeEach(async () => {
    mockEventRepo = {
      count: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockParticipantRepo = {
      createQueryBuilder: jest.fn(),
    };

    mockFinanceRepo = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockMemberRepo = {
      count: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Event), useValue: mockEventRepo },
        { provide: getRepositoryToken(EventParticipant), useValue: mockParticipantRepo },
        { provide: getRepositoryToken(FinanceTransaction), useValue: mockFinanceRepo },
        { provide: getRepositoryToken(GuildMember), useValue: mockMemberRepo },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGuildReport', () => {
    it('should return complete guild report', async () => {
      // Mock event stats
      mockEventRepo.count.mockResolvedValue(10);
      const eventQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockEventRepo.createQueryBuilder.mockReturnValue(eventQb);

      // Mock participant stats
      const participantQb = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { status: 'confirmed', count: '5' },
          { status: 'pending', count: '3' },
        ]),
      };
      mockParticipantRepo.createQueryBuilder.mockReturnValue(participantQb);

      // Mock finance stats
      const financeQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'in', total: '1000' },
          { type: 'out', total: '500' },
        ]),
      };
      mockFinanceRepo.createQueryBuilder.mockReturnValue(financeQb);
      mockFinanceRepo.find.mockResolvedValue([]);

      // Mock member stats
      mockMemberRepo.count.mockResolvedValue(15);
      const memberQb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { role: 'leader', count: '1' },
          { role: 'member', count: '14' },
        ]),
      };
      mockMemberRepo.createQueryBuilder.mockReturnValue(memberQb);
      mockMemberRepo.find.mockResolvedValue([]);

      const result = await service.getGuildReport(1);

      expect(result).toHaveProperty('events');
      expect(result).toHaveProperty('finance');
      expect(result).toHaveProperty('members');
      expect(result).toHaveProperty('generatedAt');
    });
  });

  describe('getEventStats', () => {
    it('should return event statistics', async () => {
      mockEventRepo.count.mockResolvedValue(10);

      const eventQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
        getRawMany: jest.fn().mockResolvedValue([
          { month: '2024-01', count: '5' },
          { month: '2024-02', count: '3' },
        ]),
      };
      mockEventRepo.createQueryBuilder.mockReturnValue(eventQb);

      const participantQb = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { status: 'confirmed', count: '8' },
          { status: 'pending', count: '2' },
        ]),
      };
      mockParticipantRepo.createQueryBuilder.mockReturnValue(participantQb);

      const result = await service.getEventStats(1);

      expect(result.totalEvents).toBe(10);
      expect(result.upcomingEvents).toBe(3);
      expect(result.pastEvents).toBe(7);
      expect(result.participationRate).toBe(80);
      expect(result.eventsByMonth).toHaveLength(2);
    });

    it('should handle zero participation', async () => {
      mockEventRepo.count.mockResolvedValue(5);

      const eventQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockEventRepo.createQueryBuilder.mockReturnValue(eventQb);

      const participantQb = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockParticipantRepo.createQueryBuilder.mockReturnValue(participantQb);

      const result = await service.getEventStats(1);

      expect(result.participationRate).toBe(0);
    });
  });

  describe('getFinanceStats', () => {
    it('should return finance statistics with positive balance', async () => {
      const financeQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce([
            { type: 'in', total: '5000' },
            { type: 'out', total: '2000' },
          ])
          .mockResolvedValueOnce([
            { month: '2024-01', type: 'in', total: '3000' },
            { month: '2024-01', type: 'out', total: '1000' },
          ]),
      };
      mockFinanceRepo.createQueryBuilder.mockReturnValue(financeQb);
      mockFinanceRepo.find.mockResolvedValue([
        { id: 1, type: 'in', amount: 1000, created_at: new Date() },
      ]);

      const result = await service.getFinanceStats(1);

      expect(result.totalIncome).toBe(5000);
      expect(result.totalExpenses).toBe(2000);
      expect(result.balance).toBe(3000);
      expect(result.recentTransactions).toHaveLength(1);
    });

    it('should handle negative balance', async () => {
      const financeQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce([
            { type: 'in', total: '1000' },
            { type: 'out', total: '3000' },
          ])
          .mockResolvedValueOnce([]),
      };
      mockFinanceRepo.createQueryBuilder.mockReturnValue(financeQb);
      mockFinanceRepo.find.mockResolvedValue([]);

      const result = await service.getFinanceStats(1);

      expect(result.balance).toBe(-2000);
    });
  });

  describe('getMemberStats', () => {
    it('should return member statistics', async () => {
      mockMemberRepo.count.mockResolvedValue(20);

      const memberQb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { role: 'leader', count: '2' },
          { role: 'officer', count: '5' },
          { role: 'member', count: '13' },
        ]),
      };
      mockMemberRepo.createQueryBuilder.mockReturnValue(memberQb);
      mockMemberRepo.find.mockResolvedValue([
        { id: 1, role: 'member', user: { nickname: 'Player1' } },
      ]);

      const result = await service.getMemberStats(1);

      expect(result.totalMembers).toBe(20);
      expect(result.membersByRole).toHaveLength(3);
      expect(result.membersByRole[0].role).toBe('leader');
      expect(result.membersByRole[0].count).toBe(2);
    });

    it('should handle empty guild', async () => {
      mockMemberRepo.count.mockResolvedValue(0);

      const memberQb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockMemberRepo.createQueryBuilder.mockReturnValue(memberQb);
      mockMemberRepo.find.mockResolvedValue([]);

      const result = await service.getMemberStats(1);

      expect(result.totalMembers).toBe(0);
      expect(result.membersByRole).toEqual([]);
    });
  });
});
