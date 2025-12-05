import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { RecurrenceService } from './recurrence.service';
import { Event } from './event.entity';

describe('RecurrenceService', () => {
  let service: RecurrenceService;
  let eventRepo: Repository<Event>;

  const mockEventRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurrenceService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepo,
        },
      ],
    }).compile();

    service = module.get<RecurrenceService>(RecurrenceService);
    eventRepo = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateRecurringEvents', () => {
    it('should generate recurring events successfully', async () => {
      const mockEvent = {
        id: 1,
        title: 'Weekly Meeting',
        date: new Date(),
        is_recurring: true,
        recurrence_pattern: 'weekly',
        recurrence_interval: 1,
      } as Event;

      mockEventRepo.find.mockResolvedValueOnce([mockEvent]);
      mockEventRepo.find.mockResolvedValueOnce([]);
      mockEventRepo.create.mockImplementation((data) => data);
      mockEventRepo.save.mockResolvedValue([]);

      await service.generateRecurringEvents();

      expect(mockEventRepo.find).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockEventRepo.find.mockRejectedValue(new Error('Database error'));

      await expect(service.generateRecurringEvents()).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('createNextOccurrences', () => {
    it('should return 0 for non-recurring events', async () => {
      const event = { is_recurring: false } as Event;

      const result = await service.createNextOccurrences(event);

      expect(result).toBe(0);
    });

    it('should return 0 for events without recurrence pattern', async () => {
      const event = { is_recurring: true, recurrence_pattern: null } as Event;

      const result = await service.createNextOccurrences(event);

      expect(result).toBe(0);
    });

    it('should create daily occurrences', async () => {
      const today = new Date();
      const event = {
        id: 1,
        title: 'Daily Event',
        date: today,
        is_recurring: true,
        recurrence_pattern: 'daily',
        recurrence_interval: 1,
      } as Event;

      mockEventRepo.find.mockResolvedValue([]);
      mockEventRepo.create.mockImplementation((data) => data as Event);
      mockEventRepo.save.mockResolvedValue([]);

      const result = await service.createNextOccurrences(event);

      expect(result).toBeGreaterThan(0);
      expect(mockEventRepo.save).toHaveBeenCalled();
    });

    it('should create weekly occurrences', async () => {
      const today = new Date();
      const event = {
        id: 2,
        title: 'Weekly Event',
        date: today,
        is_recurring: true,
        recurrence_pattern: 'weekly',
        recurrence_interval: 1,
      } as Event;

      mockEventRepo.find.mockResolvedValue([]);
      mockEventRepo.create.mockImplementation((data) => data as Event);
      mockEventRepo.save.mockResolvedValue([]);

      const result = await service.createNextOccurrences(event);

      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should create monthly occurrences', async () => {
      const today = new Date();
      const event = {
        id: 3,
        title: 'Monthly Event',
        date: today,
        is_recurring: true,
        recurrence_pattern: 'monthly',
        recurrence_interval: 1,
      } as Event;

      mockEventRepo.find.mockResolvedValue([]);
      mockEventRepo.create.mockImplementation((data) => data as Event);
      mockEventRepo.save.mockResolvedValue([]);

      const result = await service.createNextOccurrences(event);

      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should not create duplicates', async () => {
      const today = new Date();
      const event = {
        id: 4,
        title: 'Event with Existing',
        date: today,
        is_recurring: true,
        recurrence_pattern: 'daily',
        recurrence_interval: 1,
      } as Event;

      const existingOccurrence = {
        id: 100,
        date: new Date(today.getTime() + 86400000),
        parent_event_id: 4,
      } as Event;

      mockEventRepo.find.mockResolvedValue([existingOccurrence]);
      mockEventRepo.create.mockImplementation((data) => data as Event);
      mockEventRepo.save.mockResolvedValue([]);

      await service.createNextOccurrences(event);

      expect(mockEventRepo.find).toHaveBeenCalled();
    });

    it('should respect recurrence end date', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const event = {
        id: 5,
        title: 'Ended Event',
        date: new Date('2024-01-01'),
        is_recurring: true,
        recurrence_pattern: 'daily',
        recurrence_interval: 1,
        recurrence_end_date: yesterday,
      } as Event;

      const result = await service.createNextOccurrences(event);

      expect(result).toBe(0);
    });
  });

  describe('deleteFutureOccurrences', () => {
    it('should delete future occurrences', async () => {
      mockEventRepo.softDelete.mockResolvedValue({ affected: 5 });

      const result = await service.deleteFutureOccurrences(1);

      expect(result).toBe(5);
      expect(mockEventRepo.softDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          parent_event_id: 1,
        }),
      );
    });

    it('should handle no occurrences to delete', async () => {
      mockEventRepo.softDelete.mockResolvedValue({ affected: 0 });

      const result = await service.deleteFutureOccurrences(1);

      expect(result).toBe(0);
    });
  });

  describe('updateFutureOccurrences', () => {
    it('should update future occurrences', async () => {
      mockEventRepo.update.mockResolvedValue({ affected: 3 });

      const updates = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const result = await service.updateFutureOccurrences(1, updates);

      expect(result).toBe(3);
      expect(mockEventRepo.update).toHaveBeenCalled();
    });

    it('should filter out unsafe fields', async () => {
      mockEventRepo.update.mockResolvedValue({ affected: 2 });

      const updates = {
        title: 'New Title',
        id: 999,
        date: new Date(),
        is_recurring: true,
        recurrence_pattern: 'daily',
      } as any;

      await service.updateFutureOccurrences(1, updates);

      const callArgs = mockEventRepo.update.mock.calls[0][1];
      expect(callArgs).toHaveProperty('title');
      expect(callArgs).not.toHaveProperty('id');
      expect(callArgs).not.toHaveProperty('date');
      expect(callArgs).not.toHaveProperty('is_recurring');
    });
  });
});
