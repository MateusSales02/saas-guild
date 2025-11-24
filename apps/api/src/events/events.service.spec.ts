import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { ParticipantsService } from './participants.service';

describe('EventsService', () => {
  let service: EventsService;
  let mockEventRepo: any;
  let mockParticipantsService: any;

  const mockEvent: Event = {
    id: 1,
    name: 'Test Event',
    description: 'Test Description',
    event_date: new Date(),
    recurring: false,
    guildId: 1,
    participants: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockEvents: Event[] = [
    mockEvent,
    { ...mockEvent, id: 2, name: 'Event 2' },
  ];

  beforeEach(async () => {
    mockEventRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockParticipantsService = {
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepo,
        },
        {
          provide: ParticipantsService,
          useValue: mockParticipantsService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all events with participants', async () => {
      mockEventRepo.find.mockResolvedValue(mockEvents);

      const result = await service.findAll();

      expect(mockEventRepo.find).toHaveBeenCalledWith({
        relations: ['participants', 'participants.user'],
        order: { event_date: 'ASC' },
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no events', async () => {
      mockEventRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an event with participants', async () => {
      mockEventRepo.findOne.mockResolvedValue(mockEvent);

      const result = await service.findOne(1);

      expect(mockEventRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['participants', 'participants.user'],
      });
      expect(result.name).toBe('Test Event');
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Evento não encontrado');
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'New Event',
      description: 'New Description',
      event_date: new Date(),
      recurring: false,
      guildId: 1,
    };

    it('should create a new event', async () => {
      mockEventRepo.create.mockReturnValue({ ...mockEvent, ...createDto });
      mockEventRepo.save.mockResolvedValue({ ...mockEvent, ...createDto });

      const result = await service.create(createDto);

      expect(mockEventRepo.create).toHaveBeenCalledWith(createDto);
      expect(mockEventRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('New Event');
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Event',
    };

    it('should update an event', async () => {
      mockEventRepo.update.mockResolvedValue({ affected: 1 });
      mockEventRepo.findOne.mockResolvedValue({ ...mockEvent, ...updateDto });

      const result = await service.update(1, updateDto);

      expect(mockEventRepo.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.name).toBe('Updated Event');
    });

    it('should throw NotFoundException if event not found after update', async () => {
      mockEventRepo.update.mockResolvedValue({ affected: 0 });
      mockEventRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      mockEventRepo.findOne.mockResolvedValue(mockEvent);
      mockEventRepo.remove.mockResolvedValue(mockEvent);

      const result = await service.remove(1);

      expect(mockEventRepo.remove).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateParticipantStatus', () => {
    const statusDto = { status: 'confirmed' as const };

    it('should update participant status', async () => {
      const updatedParticipant = { eventId: 1, memberId: 1, status: 'confirmed' };
      mockParticipantsService.update.mockResolvedValue(updatedParticipant);

      const result = await service.updateParticipantStatus(1, 1, statusDto);

      expect(mockParticipantsService.update).toHaveBeenCalledWith(1, 1, statusDto);
      expect(result.status).toBe('confirmed');
    });
  });
});
