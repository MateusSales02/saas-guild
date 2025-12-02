import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog, AuditAction } from './audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let mockAuditRepo: any;

  const mockAuditLog: AuditLog = {
    id: 1,
    user_id: 1,
    user_email: 'test@example.com',
    action: 'CREATE' as AuditAction,
    entity_type: 'user',
    entity_id: 1,
    description: 'User created',
    old_values: null,
    new_values: { name: 'Test' },
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(),
  };

  beforeEach(async () => {
    mockAuditRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getRepositoryToken(AuditLog), useValue: mockAuditRepo },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const dto = {
        userId: 1,
        userEmail: 'test@example.com',
        action: 'CREATE' as AuditAction,
        entityType: 'user',
        entityId: 1,
        description: 'User created',
        newValues: { name: 'Test' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };

      mockAuditRepo.create.mockReturnValue(mockAuditLog);
      mockAuditRepo.save.mockResolvedValue(mockAuditLog);

      const result = await service.log(dto);

      expect(mockAuditRepo.create).toHaveBeenCalledWith({
        user_id: dto.userId,
        user_email: dto.userEmail,
        action: dto.action,
        entity_type: dto.entityType,
        entity_id: dto.entityId,
        description: dto.description,
        old_values: null,
        new_values: dto.newValues,
        ip_address: dto.ipAddress,
        user_agent: dto.userAgent,
      });
      expect(mockAuditRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle minimal log entry', async () => {
      const dto = {
        action: 'VIEW' as AuditAction,
        entityType: 'guild',
      };

      mockAuditRepo.create.mockReturnValue({ ...mockAuditLog, ...dto });
      mockAuditRepo.save.mockResolvedValue({ ...mockAuditLog, ...dto });

      await service.log(dto);

      expect(mockAuditRepo.create).toHaveBeenCalledWith({
        user_id: null,
        user_email: null,
        action: dto.action,
        entity_type: dto.entityType,
        entity_id: null,
        description: null,
        old_values: null,
        new_values: null,
        ip_address: null,
        user_agent: null,
      });
    });

    it('should log update with old and new values', async () => {
      const dto = {
        userId: 1,
        action: 'UPDATE' as AuditAction,
        entityType: 'member',
        entityId: 5,
        oldValues: { role: 'member' },
        newValues: { role: 'officer' },
      };

      mockAuditRepo.create.mockReturnValue(mockAuditLog);
      mockAuditRepo.save.mockResolvedValue(mockAuditLog);

      await service.log(dto);

      expect(mockAuditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          old_values: dto.oldValues,
          new_values: dto.newValues,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return logs with default pagination', async () => {
      const mockLogs = [mockAuditLog];
      mockAuditRepo.findAndCount.mockResolvedValue([mockLogs, 1]);

      const result = await service.findAll();

      expect(mockAuditRepo.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { created_at: 'DESC' },
        take: 50,
        skip: 0,
      });
      expect(result).toEqual({ logs: mockLogs, total: 1 });
    });

    it('should filter by userId', async () => {
      mockAuditRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ userId: 1 });

      expect(mockAuditRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 1 },
        }),
      );
    });

    it('should filter by entityType and entityId', async () => {
      mockAuditRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ entityType: 'guild', entityId: 5 });

      expect(mockAuditRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entity_type: 'guild', entity_id: 5 },
        }),
      );
    });

    it('should filter by action', async () => {
      mockAuditRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ action: 'DELETE' as AuditAction });

      expect(mockAuditRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { action: 'DELETE' },
        }),
      );
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      mockAuditRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ startDate, endDate });

      expect(mockAuditRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { created_at: Between(startDate, endDate) },
        }),
      );
    });

    it('should filter by startDate only', async () => {
      const startDate = new Date('2024-01-01');
      mockAuditRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ startDate });

      expect(mockAuditRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { created_at: MoreThanOrEqual(startDate) },
        }),
      );
    });

    it('should filter by endDate only', async () => {
      const endDate = new Date('2024-01-31');
      mockAuditRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ endDate });

      expect(mockAuditRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { created_at: LessThanOrEqual(endDate) },
        }),
      );
    });

    it('should apply custom pagination', async () => {
      mockAuditRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ limit: 10, offset: 20 });

      expect(mockAuditRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        }),
      );
    });
  });

  describe('findByUser', () => {
    it('should return logs for a specific user', async () => {
      const mockLogs = [mockAuditLog];
      mockAuditRepo.find.mockResolvedValue(mockLogs);

      const result = await service.findByUser(1);

      expect(mockAuditRepo.find).toHaveBeenCalledWith({
        where: { user_id: 1 },
        order: { created_at: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should apply custom limit', async () => {
      mockAuditRepo.find.mockResolvedValue([]);

      await service.findByUser(1, 100);

      expect(mockAuditRepo.find).toHaveBeenCalledWith({
        where: { user_id: 1 },
        order: { created_at: 'DESC' },
        take: 100,
      });
    });
  });

  describe('findByEntity', () => {
    it('should return logs for a specific entity', async () => {
      const mockLogs = [mockAuditLog];
      mockAuditRepo.find.mockResolvedValue(mockLogs);

      const result = await service.findByEntity('guild', 1);

      expect(mockAuditRepo.find).toHaveBeenCalledWith({
        where: { entity_type: 'guild', entity_id: 1 },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockLogs);
    });
  });
});
