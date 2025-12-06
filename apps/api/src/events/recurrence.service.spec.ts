import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurrenceService } from './recurrence.service';
import { Event } from './event.entity';

describe('RecurrenceService', () => {
  let service: RecurrenceService;
  let mockEventRepo: any;

  const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
    id: 1,
    title: 'Test Event',
    date: new Date(),
    is_recurring: true,
    recurrence_pattern: 'daily',
    recurrence_interval: 1,
    ...overrides,
  } as Event);

  beforeEach(async () => {
    mockEventRepo = {
      find: jest.fn(),
      create: jest.fn((data) => data as Event),
      save: jest.fn().mockResolvedValue([]),
      softDelete: jest.fn(),
      update: jest.fn(),
    };

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateRecurringEvents', () => {
    it('should generate recurring events successfully', async () => {
      const mockEvent = createMockEvent({ recurrence_pattern: 'weekly' });

      mockEventRepo.find.mockResolvedValueOnce([mockEvent]);
      mockEventRepo.find.mockResolvedValueOnce([]);

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
    beforeEach(() => {
      mockEventRepo.find.mockResolvedValue([]);
    });

    it.each([
      ['non-recurring events', { is_recurring: false }, 0],
      ['events without recurrence pattern', { is_recurring: true, recurrence_pattern: null }, 0],
    ])('should return 0 for %s', async (_, eventOverrides, expected) => {
      const event = createMockEvent(eventOverrides);
      const result = await service.createNextOccurrences(event);
      expect(result).toBe(expected);
    });

    it.each([
      ['daily', 'daily'],
      ['weekly', 'weekly'],
      ['monthly', 'monthly'],
    ])('should create %s occurrences', async (_, pattern) => {
      const event = createMockEvent({
        recurrence_pattern: pattern,
        date: new Date()
      });

      const result = await service.createNextOccurrences(event);

      expect(result).toBeGreaterThanOrEqual(0);
      if (result > 0) {
        expect(mockEventRepo.save).toHaveBeenCalled();
      }
    });

    it('should not create duplicates', async () => {
      const event = createMockEvent();
      const existingOccurrence = createMockEvent({
        id: 100,
        parent_event_id: event.id,
        date: new Date(Date.now() + 86400000),
      });

      mockEventRepo.find.mockResolvedValue([existingOccurrence]);

      await service.createNextOccurrences(event);

      expect(mockEventRepo.find).toHaveBeenCalled();
    });

    it('should respect recurrence end date', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const event = createMockEvent({
        date: new Date('2024-01-01'),
        recurrence_end_date: yesterday,
      });

      const result = await service.createNextOccurrences(event);

      expect(result).toBe(0);
    });
  });

  describe('deleteFutureOccurrences', () => {
    it.each([
      [5, 5],
      [0, 0],
    ])('should handle %d affected rows', async (affected, expected) => {
      mockEventRepo.softDelete.mockResolvedValue({ affected });

      const result = await service.deleteFutureOccurrences(1);

      expect(result).toBe(expected);
      expect(mockEventRepo.softDelete).toHaveBeenCalled();
    });
  });

  describe('updateFutureOccurrences', () => {
    it('should update future occurrences', async () => {
      mockEventRepo.update.mockResolvedValue({ affected: 3 });

      const result = await service.updateFutureOccurrences(1, {
        title: 'Updated Title',
        description: 'Updated Description',
      });

      expect(result).toBe(3);
      expect(mockEventRepo.update).toHaveBeenCalled();
    });

    it('should filter out unsafe fields', async () => {
      mockEventRepo.update.mockResolvedValue({ affected: 2 });

      await service.updateFutureOccurrences(1, {
        title: 'New Title',
        id: 999,
        date: new Date(),
        is_recurring: true,
        recurrence_pattern: 'daily',
      } as any);

      const callArgs = mockEventRepo.update.mock.calls[0][1];
      expect(callArgs).toHaveProperty('title');
      expect(callArgs).not.toHaveProperty('id');
      expect(callArgs).not.toHaveProperty('date');
      expect(callArgs).not.toHaveProperty('is_recurring');
    });
  });
});
