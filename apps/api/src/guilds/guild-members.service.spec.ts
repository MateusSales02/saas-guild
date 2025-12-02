import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GuildMembersService } from './guild-members.service';
import { GuildMember } from './guild-member.entity';
import { User } from '../users/user.entity';
import { Guild } from './guild.entity';

describe('GuildMembersService', () => {
  let service: GuildMembersService;
  let mockGuildMembersRepo: any;
  let mockUsersRepo: any;
  let mockGuildsRepo: any;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password_hash: 'hash',
    nickname: 'TestUser',
    role: 'leader',
    uid: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockGuild: Guild = {
    id: 1,
    name: 'Test Guild',
    created_at: new Date(),
    updated_at: new Date(),
    members: [],
    events: [],
    transactions: [],
  };

  const mockGuildMember: GuildMember = {
    id: 1,
    user: mockUser,
    guild: mockGuild,
    role: 'líder',
    joined_at: new Date(),
  };

  beforeEach(async () => {
    mockGuildMembersRepo = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockUsersRepo = {
      findOneBy: jest.fn(),
    };

    mockGuildsRepo = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildMembersService,
        {
          provide: getRepositoryToken(GuildMember),
          useValue: mockGuildMembersRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepo,
        },
        {
          provide: getRepositoryToken(Guild),
          useValue: mockGuildsRepo,
        },
      ],
    }).compile();

    service = module.get<GuildMembersService>(GuildMembersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all guild members', async () => {
      mockGuildMembersRepo.find.mockResolvedValue([mockGuildMember]);

      const result = await service.findAll();

      expect(mockGuildMembersRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockGuildMember]);
    });
  });

  describe('findByGuild', () => {
    it('should return guild members by guild id', async () => {
      mockGuildMembersRepo.find.mockResolvedValue([mockGuildMember]);

      const result = await service.findByGuild(1);

      expect(mockGuildMembersRepo.find).toHaveBeenCalledWith({
        where: { guild: { id: 1 } },
        relations: ['user', 'guild'],
      });
      expect(result).toEqual([mockGuildMember]);
    });
  });

  describe('findOne', () => {
    it('should return a guild member by id', async () => {
      mockGuildMembersRepo.findOneBy.mockResolvedValue(mockGuildMember);

      const result = await service.findOne(1);

      expect(mockGuildMembersRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockGuildMember);
    });

    it('should return null if member not found', async () => {
      mockGuildMembersRepo.findOneBy.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new guild member', async () => {
      const createData = {
        userId: 1,
        guildId: 1,
        role: 'membro',
      };

      mockUsersRepo.findOneBy.mockResolvedValue(mockUser);
      mockGuildsRepo.findOneBy.mockResolvedValue(mockGuild);
      mockGuildMembersRepo.create.mockReturnValue(mockGuildMember);
      mockGuildMembersRepo.save.mockResolvedValue(mockGuildMember);

      const result = await service.create(createData);

      expect(mockUsersRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockGuildsRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockGuildMembersRepo.create).toHaveBeenCalled();
      expect(mockGuildMembersRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockGuildMember);
    });

    it('should throw error if user not found', async () => {
      const createData = {
        userId: 999,
        guildId: 1,
        role: 'membro',
      };

      mockUsersRepo.findOneBy.mockResolvedValue(null);
      mockGuildsRepo.findOneBy.mockResolvedValue(mockGuild);

      await expect(service.create(createData)).rejects.toThrow(
        'User or Guild not found',
      );
    });

    it('should throw error if guild not found', async () => {
      const createData = {
        userId: 1,
        guildId: 999,
        role: 'membro',
      };

      mockUsersRepo.findOneBy.mockResolvedValue(mockUser);
      mockGuildsRepo.findOneBy.mockResolvedValue(null);

      await expect(service.create(createData)).rejects.toThrow(
        'User or Guild not found',
      );
    });
  });

  describe('update', () => {
    it('should update a guild member', async () => {
      const updateData = { role: 'oficial' };
      mockGuildMembersRepo.update.mockResolvedValue({ affected: 1 });
      mockGuildMembersRepo.findOneBy.mockResolvedValue({
        ...mockGuildMember,
        role: 'oficial',
      });

      const result = await service.update(1, updateData);

      expect(mockGuildMembersRepo.update).toHaveBeenCalledWith(1, updateData);
      expect(result?.role).toBe('oficial');
    });

    it('should return null if member not found after update', async () => {
      mockGuildMembersRepo.update.mockResolvedValue({ affected: 0 });
      mockGuildMembersRepo.findOneBy.mockResolvedValue(null);

      const result = await service.update(999, { role: 'oficial' });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a guild member', async () => {
      mockGuildMembersRepo.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockGuildMembersRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
