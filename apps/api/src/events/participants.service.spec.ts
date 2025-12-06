import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { EventParticipant } from './event-participant.entity';
import { Event } from './event.entity';
import { User } from '../users/user.entity';

describe('ParticipantsService', () => {
  let service: ParticipantsService;
  let mockParticipantsRepo: any;
  let mockEventsRepo: any;
  let mockUsersRepo: any;

  const mockEvent = { id: 1, title: 'Test Event' } as Event;
  const mockUser = { id: 1, email: 'test@test.com' } as User;
  const mockParticipant = {
    id: 1,
    event: mockEvent,
    user: mockUser,
    status: 'confirmed',
  } as EventParticipant;

  beforeEach(async () => {
    mockParticipantsRepo = {
      create: jest.fn((data) => data),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    mockEventsRepo = {
      findOneBy: jest.fn(),
    };

    mockUsersRepo = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantsService,
        {
          provide: getRepositoryToken(EventParticipant),
          useValue: mockParticipantsRepo,
        },
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventsRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepo,
        },
      ],
    }).compile();

    service = module.get<ParticipantsService>(ParticipantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a participant', async () => {
      mockEventsRepo.findOneBy.mockResolvedValue(mockEvent);
      mockUsersRepo.findOneBy.mockResolvedValue(mockUser);
      mockParticipantsRepo.save.mockResolvedValue(mockParticipant);

      const result = await service.create(1, { userId: 1, status: 'confirmed' });

      expect(mockEventsRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockUsersRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockParticipantsRepo.create).toHaveBeenCalledWith({
        event: mockEvent,
        user: mockUser,
        status: 'confirmed',
      });
      expect(result).toEqual(mockParticipant);
    });

    it('should use default status "pending" when not provided', async () => {
      mockEventsRepo.findOneBy.mockResolvedValue(mockEvent);
      mockUsersRepo.findOneBy.mockResolvedValue(mockUser);
      mockParticipantsRepo.save.mockResolvedValue(mockParticipant);

      await service.create(1, { userId: 1 });

      expect(mockParticipantsRepo.create).toHaveBeenCalledWith({
        event: mockEvent,
        user: mockUser,
        status: 'pending',
      });
    });

    it('should throw NotFoundException when event not found', async () => {
      mockEventsRepo.findOneBy.mockResolvedValue(null);

      await expect(service.create(1, { userId: 1 })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(1, { userId: 1 })).rejects.toThrow(
        'Evento 1 não encontrado',
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      mockEventsRepo.findOneBy.mockResolvedValue(mockEvent);
      mockUsersRepo.findOneBy.mockResolvedValue(null);

      await expect(service.create(1, { userId: 1 })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(1, { userId: 1 })).rejects.toThrow(
        'Usuário 1 não encontrado',
      );
    });
  });

  describe('findAll', () => {
    it('should return all participants for an event', async () => {
      const participants = [mockParticipant];
      mockParticipantsRepo.find.mockResolvedValue(participants);

      const result = await service.findAll(1);

      expect(mockParticipantsRepo.find).toHaveBeenCalledWith({
        where: { event: { id: 1 } },
        relations: ['user'],
      });
      expect(result).toEqual(participants);
    });
  });

  describe('update', () => {
    it('should update participant status', async () => {
      mockParticipantsRepo.findOne.mockResolvedValue(mockParticipant);
      mockParticipantsRepo.save.mockResolvedValue({
        ...mockParticipant,
        status: 'declined',
      });

      const result = await service.update(1, 1, { status: 'declined' });

      expect(mockParticipantsRepo.findOne).toHaveBeenCalledWith({
        where: { event: { id: 1 }, user: { id: 1 } },
        relations: ['event', 'user'],
      });
      expect(result.status).toBe('declined');
    });

    it('should throw NotFoundException when participant not found', async () => {
      mockParticipantsRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, 1, { status: 'confirmed' }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(1, 1, { status: 'confirmed' }),
      ).rejects.toThrow(
        'Participante não encontrado para user 1 no evento 1',
      );
    });
  });

  describe('remove', () => {
    it('should remove a participant', async () => {
      mockParticipantsRepo.findOne.mockResolvedValue(mockParticipant);
      mockParticipantsRepo.remove.mockResolvedValue(mockParticipant);

      const result = await service.remove(1, 1);

      expect(mockParticipantsRepo.findOne).toHaveBeenCalledWith({
        where: { event: { id: 1 }, user: { id: 1 } },
      });
      expect(mockParticipantsRepo.remove).toHaveBeenCalledWith(mockParticipant);
      expect(result).toEqual(mockParticipant);
    });

    it('should throw NotFoundException when participant not found', async () => {
      mockParticipantsRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
      await expect(service.remove(1, 1)).rejects.toThrow(
        'Participante não encontrado',
      );
    });
  });
});
