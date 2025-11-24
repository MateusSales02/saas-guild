import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExportService } from './export.service';
import { Event } from '../events/event.entity';
import { FinanceTransaction } from '../finance/finance-transaction.entity';
import { GuildMember } from '../guilds/guild-member.entity';

describe('ExportService', () => {
  let service: ExportService;
  let mockEventRepo: any;
  let mockFinanceRepo: any;
  let mockMemberRepo: any;

  beforeEach(async () => {
    mockEventRepo = {
      find: jest.fn(),
    };

    mockFinanceRepo = {
      find: jest.fn(),
    };

    mockMemberRepo = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        { provide: getRepositoryToken(Event), useValue: mockEventRepo },
        {
          provide: getRepositoryToken(FinanceTransaction),
          useValue: mockFinanceRepo,
        },
        {
          provide: getRepositoryToken(GuildMember),
          useValue: mockMemberRepo,
        },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportMembers', () => {
    it('should export members to CSV format', async () => {
      const mockMembers = [
        {
          id: 1,
          role: 'leader',
          user: { id: 1, nickname: 'Leader1', email: 'leader@test.com' },
        },
        {
          id: 2,
          role: 'member',
          user: { id: 2, nickname: 'Member1', email: 'member@test.com' },
        },
      ];
      mockMemberRepo.find.mockResolvedValue(mockMembers);

      const result = await service.exportMembers(1);

      expect(mockMemberRepo.find).toHaveBeenCalledWith({
        where: { guild: { id: 1 } },
        relations: ['user'],
        order: { id: 'ASC' },
      });
      expect(result).toContain('id,user_id,nickname,email,role,joined_at');
      expect(result).toContain('Leader1');
      expect(result).toContain('Member1');
      expect(result).toContain('leader@test.com');
    });

    it('should handle empty members list', async () => {
      mockMemberRepo.find.mockResolvedValue([]);

      const result = await service.exportMembers(1);

      expect(result).toBe('id,user_id,nickname,email,role,joined_at\n');
    });

    it('should handle members without user data', async () => {
      const mockMembers = [{ id: 1, role: 'member', user: null }];
      mockMemberRepo.find.mockResolvedValue(mockMembers);

      const result = await service.exportMembers(1);

      expect(result).toContain('1,,,');
    });
  });

  describe('exportEvents', () => {
    it('should export events to CSV format', async () => {
      const mockEvents = [
        {
          id: 1,
          title: 'Raid Night',
          description: 'Weekly raid',
          date: new Date('2024-01-15'),
          type: 'RAID',
          location: 'Dungeon A',
          participants: [
            { status: 'confirmed' },
            { status: 'confirmed' },
            { status: 'pending' },
          ],
        },
        {
          id: 2,
          title: 'PvP Event',
          description: null,
          date: new Date('2024-01-20'),
          type: 'PVP',
          location: null,
          participants: [],
        },
      ];
      mockEventRepo.find.mockResolvedValue(mockEvents);

      const result = await service.exportEvents(1);

      expect(mockEventRepo.find).toHaveBeenCalledWith({
        where: { guild: { id: 1 } },
        relations: ['participants', 'participants.user'],
        order: { date: 'DESC' },
      });
      expect(result).toContain(
        'id,title,description,date,type,location,participants_count,confirmed_count',
      );
      expect(result).toContain('Raid Night');
      expect(result).toContain('Weekly raid');
      expect(result).toContain('RAID');
      expect(result).toContain('PvP Event');
      expect(result).toContain('PVP');
    });

    it('should handle empty events list', async () => {
      mockEventRepo.find.mockResolvedValue([]);

      const result = await service.exportEvents(1);

      expect(result).toBe(
        'id,title,description,date,type,location,participants_count,confirmed_count\n',
      );
    });

    it('should escape special characters in CSV', async () => {
      const mockEvents = [
        {
          id: 1,
          title: 'Event, with comma',
          description: 'Description with "quotes"',
          date: new Date('2024-01-15'),
          type: 'GATHERING',
          location: '',
          participants: [],
        },
      ];
      mockEventRepo.find.mockResolvedValue(mockEvents);

      const result = await service.exportEvents(1);

      expect(result).toContain('"Event, with comma"');
      expect(result).toContain('"Description with ""quotes"""');
    });
  });

  describe('exportFinance', () => {
    it('should export transactions to CSV format', async () => {
      const mockTransactions = [
        {
          id: 1,
          type: 'in',
          amount: 1000,
          note: 'Donation',
          created_at: new Date('2024-01-10'),
        },
        {
          id: 2,
          type: 'out',
          amount: 500,
          note: 'Equipment',
          created_at: new Date('2024-01-12'),
        },
      ];
      mockFinanceRepo.find.mockResolvedValue(mockTransactions);

      const result = await service.exportFinance(1);

      expect(mockFinanceRepo.find).toHaveBeenCalledWith({
        where: { guild: { id: 1 } },
        order: { created_at: 'DESC' },
      });
      expect(result).toContain('id,type,amount,note,created_at');
      expect(result).toContain('Entrada'); // type = 'in'
      expect(result).toContain('Saída'); // type = 'out'
      expect(result).toContain('1000');
      expect(result).toContain('500');
    });

    it('should handle empty transactions list', async () => {
      mockFinanceRepo.find.mockResolvedValue([]);

      const result = await service.exportFinance(1);

      expect(result).toBe('id,type,amount,note,created_at\n');
    });

    it('should handle null notes', async () => {
      const mockTransactions = [
        {
          id: 1,
          type: 'in',
          amount: 100,
          note: null,
          created_at: new Date('2024-01-10'),
        },
      ];
      mockFinanceRepo.find.mockResolvedValue(mockTransactions);

      const result = await service.exportFinance(1);

      expect(result).toContain('1,Entrada,100,');
    });
  });

  describe('exportFullReport', () => {
    it('should combine all exports into one report', async () => {
      mockMemberRepo.find.mockResolvedValue([
        {
          id: 1,
          role: 'leader',
          user: { id: 1, nickname: 'Leader', email: 'leader@test.com' },
        },
      ]);
      mockEventRepo.find.mockResolvedValue([
        {
          id: 1,
          title: 'Event1',
          description: '',
          date: new Date(),
          type: 'RAID',
          location: '',
          participants: [],
        },
      ]);
      mockFinanceRepo.find.mockResolvedValue([
        {
          id: 1,
          type: 'in',
          amount: 100,
          note: 'Test',
          created_at: new Date(),
        },
      ]);

      const result = await service.exportFullReport(1);

      expect(result).toContain('=== MEMBROS ===');
      expect(result).toContain('=== EVENTOS ===');
      expect(result).toContain('=== TRANSAÇÕES FINANCEIRAS ===');
      expect(result).toContain('Leader');
      expect(result).toContain('Event1');
      expect(result).toContain('Entrada');
    });

    it('should handle all empty sections', async () => {
      mockMemberRepo.find.mockResolvedValue([]);
      mockEventRepo.find.mockResolvedValue([]);
      mockFinanceRepo.find.mockResolvedValue([]);

      const result = await service.exportFullReport(1);

      expect(result).toContain('=== MEMBROS ===');
      expect(result).toContain('=== EVENTOS ===');
      expect(result).toContain('=== TRANSAÇÕES FINANCEIRAS ===');
    });
  });
});
