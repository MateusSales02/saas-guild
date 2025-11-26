import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GuildsService } from './guilds.service';
import { Guild } from './guild.entity';
import { GuildMember } from './guild-member.entity';

describe('GuildsService', () => {
  let service: GuildsService;
  let mockGuildsRepo: any;
  let mockGmRepo: any;

  const mockGuild: Guild = {
    id: 1,
    name: 'Test Guild',
    created_at: new Date(),
    updated_at: new Date(),
    members: [],
    events: [],
    transactions: [],
  };

  const mockGuilds: Guild[] = [
    mockGuild,
    { ...mockGuild, id: 2, name: 'Guild 2' },
  ];

  beforeEach(async () => {
    mockGuildsRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockGmRepo = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildsService,
        {
          provide: getRepositoryToken(Guild),
          useValue: mockGuildsRepo,
        },
        {
          provide: getRepositoryToken(GuildMember),
          useValue: mockGmRepo,
        },
      ],
    }).compile();

    service = module.get<GuildsService>(GuildsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all guilds', async () => {
      mockGuildsRepo.find.mockResolvedValue(mockGuilds);

      const result = await service.findAll();

      expect(mockGuildsRepo.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Test Guild');
    });

    it('should return empty array if no guilds', async () => {
      mockGuildsRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a guild by id', async () => {
      mockGuildsRepo.findOne.mockResolvedValue(mockGuild);

      const result = await service.findOne(1);

      expect(mockGuildsRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result?.name).toBe('Test Guild');
    });

    it('should return null if guild not found', async () => {
      mockGuildsRepo.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new guild', async () => {
      const guildData = { name: 'New Guild' };
      mockGuildsRepo.create.mockReturnValue({ ...mockGuild, ...guildData });
      mockGuildsRepo.save.mockResolvedValue({ ...mockGuild, ...guildData });

      const result = await service.create(guildData);

      expect(mockGuildsRepo.create).toHaveBeenCalledWith(guildData);
      expect(mockGuildsRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('New Guild');
    });
  });

  describe('update', () => {
    it('should update a guild', async () => {
      const updateData = { name: 'Updated Guild' };
      mockGuildsRepo.update.mockResolvedValue({ affected: 1 });
      mockGuildsRepo.findOne.mockResolvedValue({ ...mockGuild, ...updateData });

      const result = await service.update(1, updateData);

      expect(mockGuildsRepo.update).toHaveBeenCalledWith(1, updateData);
      expect(result?.name).toBe('Updated Guild');
    });

    it('should return null if guild not found after update', async () => {
      mockGuildsRepo.update.mockResolvedValue({ affected: 0 });
      mockGuildsRepo.findOne.mockResolvedValue(null);

      const result = await service.update(999, { name: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a guild', async () => {
      mockGuildsRepo.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockGuildsRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findByMember', () => {
    it('should return guilds for a specific user', async () => {
      const mockGuildMembers = [
        { id: 1, guild: mockGuild, user: { id: 1 } },
        { id: 2, guild: { ...mockGuild, id: 2, name: 'Guild 2' }, user: { id: 1 } },
      ];
      mockGmRepo.find.mockResolvedValue(mockGuildMembers);

      const result = await service.findByMember(1);

      expect(mockGmRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['guild'],
        order: { id: 'ASC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Test Guild');
    });

    it('should return empty array if user has no guilds', async () => {
      mockGmRepo.find.mockResolvedValue([]);

      const result = await service.findByMember(999);

      expect(result).toEqual([]);
    });
  });

  describe('createGuildWithLeader', () => {
    it('should create a guild and assign user as leader', async () => {
      const userId = 1;
      const guildName = 'New Guild';
      const savedGuild = { ...mockGuild, name: guildName };
      const guildMember = {
        id: 1,
        user: { id: userId },
        guild: savedGuild,
        role: 'líder',
      };

      mockGuildsRepo.create.mockReturnValue(savedGuild);
      mockGuildsRepo.save.mockResolvedValue(savedGuild);
      mockGmRepo.create.mockReturnValue(guildMember);
      mockGmRepo.save.mockResolvedValue(guildMember);

      const result = await service.createGuildWithLeader(userId, guildName);

      expect(mockGuildsRepo.create).toHaveBeenCalledWith({ name: guildName });
      expect(mockGuildsRepo.save).toHaveBeenCalled();
      expect(mockGmRepo.create).toHaveBeenCalledWith({
        user: { id: userId },
        guild: savedGuild,
        role: 'líder',
      });
      expect(mockGmRepo.save).toHaveBeenCalled();
      expect(result.name).toBe(guildName);
    });
  });
});
