import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BuildsService } from './builds.service';
import { Build } from './build.entity';
import { BuildClass } from './build-class.entity';
import { BuildSpec } from './build-spec.entity';
import { BuildItem } from './build-item.entity';
import { BuildVote } from './build-vote.entity';
import { Guild } from '../guilds/guild.entity';
import { User } from '../users/user.entity';
import { GuildMember } from '../guilds/guild-member.entity';

describe('BuildsService', () => {
  let service: BuildsService;
  let mockBuildRepo: any;
  let mockClassRepo: any;
  let mockSpecRepo: any;
  let mockItemRepo: any;
  let mockGuildRepo: any;
  let mockUserRepo: any;
  let mockMemberRepo: any;
  let mockCacheManager: any;
  let mockVoteRepo: any;

  const mockClass: BuildClass = {
    id: 1,
    name: 'Guerreiro',
    description: 'Tank class',
    specs: [],
    builds: [],
  };

  const mockSpec: BuildSpec = {
    id: 1,
    name: 'Defensor',
    description: 'Tank spec',
    class: mockClass,
    builds: [],
  };

  const mockItem: BuildItem = {
    id: 1,
    name: 'Espada Longa',
    slot: 'Arma',
    builds: [],
  };

  const mockBuild: Build = {
    id: 1,
    name: 'Tank Build',
    description: 'Test build',
    role: 'Tank',
    is_public: true,
    class: mockClass,
    spec: mockSpec,
    items: [mockItem],
    guild: null,
    author: null,
    member: null,
    created_at: new Date(),
  };

  beforeEach(async () => {
    mockBuildRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      softRemove: jest.fn(),
      restore: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockClassRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    mockSpecRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockItemRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      clear: jest.fn(),
    };

    mockGuildRepo = {
      findOne: jest.fn(),
    };

    mockUserRepo = {
      findOne: jest.fn(),
    };

    mockMemberRepo = {
      findOne: jest.fn(),
    };

    mockVoteRepo = {
      findOne: jest.fn(),
      create: jest.fn((v) => v),
      save: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    mockBuildRepo.update = jest.fn();

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuildsService,
        { provide: getRepositoryToken(Build), useValue: mockBuildRepo },
        { provide: getRepositoryToken(BuildClass), useValue: mockClassRepo },
        { provide: getRepositoryToken(BuildSpec), useValue: mockSpecRepo },
        { provide: getRepositoryToken(BuildItem), useValue: mockItemRepo },
        { provide: getRepositoryToken(Guild), useValue: mockGuildRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(GuildMember), useValue: mockMemberRepo },
        { provide: getRepositoryToken(BuildVote), useValue: mockVoteRepo },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<BuildsService>(BuildsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all builds with filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBuild]),
      };
      mockBuildRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({});

      expect(mockBuildRepo.createQueryBuilder).toHaveBeenCalledWith('build');
      expect(result).toHaveLength(1);
    });

    it('should apply search filter', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBuild]),
      };
      mockBuildRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll({ search: 'Tank' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(build.name ILIKE :q OR build.description ILIKE :q)',
        { q: '%Tank%' },
      );
    });

    it('should apply classId filter', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBuild]),
      };
      mockBuildRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll({ classId: 1 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'class.id = :classId',
        { classId: 1 },
      );
    });
  });

  describe('findOne', () => {
    it('should return a build by id', async () => {
      mockBuildRepo.findOne.mockResolvedValue(mockBuild);

      const result = await service.findOne(1);

      expect(mockBuildRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [
          'class',
          'spec',
          'items',
          'guild',
          'author',
          'member',
          'member.user',
        ],
      });
      expect(result.name).toBe('Tank Build');
    });

    it('should throw NotFoundException if build not found', async () => {
      mockBuildRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Build não encontrada',
      );
    });
  });

  describe('create', () => {
    it('should create a new build', async () => {
      const createDto = {
        name: 'New Build',
        description: 'Test',
        role: 'DPS',
        classId: 1,
        specId: 1,
      };

      mockBuildRepo.create.mockReturnValue(mockBuild);
      mockClassRepo.findOne.mockResolvedValue(mockClass);
      mockSpecRepo.findOne.mockResolvedValue(mockSpec);
      mockBuildRepo.save.mockResolvedValue(mockBuild);

      const result = await service.create(createDto);

      expect(mockBuildRepo.create).toHaveBeenCalled();
      expect(mockBuildRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockBuild);
    });

    it('should throw NotFoundException if class not found', async () => {
      const createDto = {
        name: 'New Build',
        classId: 999,
      };

      mockBuildRepo.create.mockReturnValue({});
      mockClassRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleVote', () => {
    it('should add a vote when the user has not voted yet', async () => {
      mockBuildRepo.findOne.mockResolvedValue(mockBuild);
      mockVoteRepo.findOne.mockResolvedValue(null);
      mockVoteRepo.count.mockResolvedValue(3);

      const result = await service.toggleVote(1, 7);

      expect(mockVoteRepo.save).toHaveBeenCalledWith({
        build: { id: 1 },
        user: { id: 7 },
      });
      expect(mockBuildRepo.update).toHaveBeenCalledWith(1, { vote_count: 3 });
      expect(result).toEqual({ voted: true, vote_count: 3 });
    });

    it('should remove the vote when the user already voted', async () => {
      const vote = { id: 5 };
      mockBuildRepo.findOne.mockResolvedValue(mockBuild);
      mockVoteRepo.findOne.mockResolvedValue(vote);
      mockVoteRepo.count.mockResolvedValue(0);

      const result = await service.toggleVote(1, 7);

      expect(mockVoteRepo.remove).toHaveBeenCalledWith(vote);
      expect(mockVoteRepo.save).not.toHaveBeenCalled();
      expect(result).toEqual({ voted: false, vote_count: 0 });
    });

    it('should throw NotFoundException if build not found', async () => {
      mockBuildRepo.findOne.mockResolvedValue(null);
      await expect(service.toggleVote(99, 7)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('votedBuildIds', () => {
    it('should return the ids of builds voted by the user', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ id: '2' }, { id: 4 }]),
      };
      mockVoteRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(service.votedBuildIds(7)).resolves.toEqual([2, 4]);
      expect(qb.where).toHaveBeenCalledWith('vote.user_id = :userId', {
        userId: 7,
      });
    });
  });

  describe('remove', () => {
    it('should soft remove a build', async () => {
      mockBuildRepo.findOne.mockResolvedValue(mockBuild);
      mockBuildRepo.softRemove.mockResolvedValue(mockBuild);

      const result = await service.remove(1);

      expect(mockBuildRepo.softRemove).toHaveBeenCalledWith(mockBuild);
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('Classes', () => {
    describe('listClasses', () => {
      it('should return all classes', async () => {
        mockCacheManager.get.mockResolvedValue(null); // No cache hit
        mockClassRepo.find.mockResolvedValue([mockClass]);

        const result = await service.listClasses();

        expect(mockClassRepo.find).toHaveBeenCalledWith({
          order: { name: 'ASC' },
        });
        expect(mockCacheManager.set).toHaveBeenCalled();
        expect(result).toHaveLength(1);
      });

      it('should return cached classes if available', async () => {
        mockCacheManager.get.mockResolvedValue([mockClass]);

        const result = await service.listClasses();

        expect(mockClassRepo.find).not.toHaveBeenCalled();
        expect(result).toHaveLength(1);
      });
    });

    describe('createClass', () => {
      it('should create a new class', async () => {
        mockClassRepo.create.mockReturnValue(mockClass);
        mockClassRepo.save.mockResolvedValue(mockClass);

        const result = await service.createClass({
          name: 'Guerreiro',
          description: 'Tank',
        });

        expect(mockClassRepo.create).toHaveBeenCalled();
        expect(mockCacheManager.del).toHaveBeenCalledWith('build-classes:all');
        expect(result).toEqual(mockClass);
      });
    });

    describe('updateClass', () => {
      it('should update a class', async () => {
        mockClassRepo.update.mockResolvedValue({ affected: 1 });
        mockClassRepo.findOne.mockResolvedValue({
          ...mockClass,
          name: 'Updated',
        });

        const result = await service.updateClass(1, { name: 'Updated' });

        expect(mockCacheManager.del).toHaveBeenCalledWith('build-classes:all');
        expect(result.name).toBe('Updated');
      });

      it('should throw NotFoundException if class not found', async () => {
        mockClassRepo.update.mockResolvedValue({ affected: 0 });
        mockClassRepo.findOne.mockResolvedValue(null);

        await expect(
          service.updateClass(999, { name: 'Test' }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('removeClass', () => {
      it('should delete a class', async () => {
        mockClassRepo.delete.mockResolvedValue({ affected: 1 });

        const result = await service.removeClass(1);

        expect(mockCacheManager.del).toHaveBeenCalledWith('build-classes:all');
        expect(result).toEqual({ deleted: true });
      });
    });
  });

  describe('Specs', () => {
    describe('listSpecs', () => {
      it('should return all specs', async () => {
        mockSpecRepo.find.mockResolvedValue([mockSpec]);

        const result = await service.listSpecs();

        expect(mockSpecRepo.find).toHaveBeenCalledWith({
          where: {},
          order: { name: 'ASC' },
        });
        expect(result).toHaveLength(1);
      });

      it('should filter by classId', async () => {
        mockSpecRepo.find.mockResolvedValue([mockSpec]);

        await service.listSpecs(1);

        expect(mockSpecRepo.find).toHaveBeenCalledWith({
          where: { class: { id: 1 } },
          order: { name: 'ASC' },
        });
      });
    });

    describe('createSpec', () => {
      it('should create a new spec', async () => {
        mockClassRepo.findOne.mockResolvedValue(mockClass);
        mockSpecRepo.create.mockReturnValue(mockSpec);
        mockSpecRepo.save.mockResolvedValue(mockSpec);

        const result = await service.createSpec({
          name: 'Defensor',
          classId: 1,
        });

        expect(result).toEqual(mockSpec);
      });

      it('should throw NotFoundException if class not found', async () => {
        mockClassRepo.findOne.mockResolvedValue(null);

        await expect(
          service.createSpec({ name: 'Spec', classId: 999 }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('removeSpec', () => {
      it('should delete a spec', async () => {
        mockSpecRepo.delete.mockResolvedValue({ affected: 1 });

        const result = await service.removeSpec(1);

        expect(result).toEqual({ deleted: true });
      });
    });
  });

  describe('Items', () => {
    describe('listItems', () => {
      it('should return all items', async () => {
        mockCacheManager.get.mockResolvedValue(null); // No cache hit
        mockItemRepo.find.mockResolvedValue([mockItem]);

        const result = await service.listItems();

        expect(mockItemRepo.find).toHaveBeenCalledWith({
          order: { name: 'ASC' },
        });
        expect(mockCacheManager.set).toHaveBeenCalled();
        expect(result).toHaveLength(1);
      });

      it('should return cached items if available', async () => {
        mockCacheManager.get.mockResolvedValue([mockItem]);

        const result = await service.listItems();

        expect(mockItemRepo.find).not.toHaveBeenCalled();
        expect(result).toHaveLength(1);
      });
    });

    describe('createItem', () => {
      it('should create a new item', async () => {
        mockItemRepo.create.mockReturnValue(mockItem);
        mockItemRepo.save.mockResolvedValue(mockItem);

        const result = await service.createItem({
          name: 'Espada',
          slot: 'Arma',
        });

        expect(mockCacheManager.del).toHaveBeenCalledWith('build-items:all');
        expect(result).toEqual(mockItem);
      });
    });

    describe('removeItem', () => {
      it('should delete an item', async () => {
        mockItemRepo.delete.mockResolvedValue({ affected: 1 });

        const result = await service.removeItem(1);

        expect(mockCacheManager.del).toHaveBeenCalledWith('build-items:all');
        expect(result).toEqual({ deleted: true });
      });
    });
  });

  describe('seedDefaults', () => {
    it('should seed default data if empty', async () => {
      mockItemRepo.count.mockResolvedValue(0);
      mockClassRepo.count.mockResolvedValue(0);
      mockClassRepo.create.mockImplementation((data) => data);
      mockClassRepo.save.mockResolvedValue([mockClass]);
      mockSpecRepo.create.mockImplementation((data) => data);
      mockSpecRepo.save.mockResolvedValue([mockSpec]);
      mockItemRepo.create.mockImplementation((data) => data);
      mockItemRepo.save.mockResolvedValue([mockItem]);
      mockItemRepo.find.mockResolvedValue([mockItem, mockItem, mockItem, mockItem]);
      mockBuildRepo.create.mockReturnValue(mockBuild);
      mockBuildRepo.save.mockResolvedValue(mockBuild);

      await service.seedDefaults();

      expect(mockClassRepo.save).toHaveBeenCalled();
      expect(mockItemRepo.save).toHaveBeenCalled();
    });

    it('should not seed if data already exists', async () => {
      mockItemRepo.count.mockResolvedValue(10);
      mockClassRepo.count.mockResolvedValue(5);

      await service.seedDefaults();

      expect(mockClassRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll with filters', () => {
    beforeEach(() => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBuild]),
      };
      mockBuildRepo.createQueryBuilder.mockReturnValue(mockQb);
    });

    it('should filter by search query', async () => {
      await service.findAll({ search: 'tank' });

      const qb = mockBuildRepo.createQueryBuilder();
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ q: '%tank%' }),
      );
    });

    it('should filter by classId', async () => {
      await service.findAll({ classId: 1 });

      const qb = mockBuildRepo.createQueryBuilder();
      expect(qb.andWhere).toHaveBeenCalledWith(
        'class.id = :classId',
        { classId: 1 },
      );
    });

    it('should filter by specId', async () => {
      await service.findAll({ specId: 2 });

      const qb = mockBuildRepo.createQueryBuilder();
      expect(qb.andWhere).toHaveBeenCalledWith(
        'spec.id = :specId',
        { specId: 2 },
      );
    });

    it('should filter by guildId', async () => {
      await service.findAll({ guildId: 3 });

      const qb = mockBuildRepo.createQueryBuilder();
      expect(qb.andWhere).toHaveBeenCalledWith(
        '(guild.id = :guildId OR build.is_public = true)',
        { guildId: 3 },
      );
    });

    it('should filter by authorId', async () => {
      await service.findAll({ authorId: 4 });

      const qb = mockBuildRepo.createQueryBuilder();
      expect(qb.andWhere).toHaveBeenCalledWith(
        'author.id = :authorId',
        { authorId: 4 },
      );
    });

    it('should filter only public builds', async () => {
      await service.findAll({ onlyPublic: true });

      const qb = mockBuildRepo.createQueryBuilder();
      expect(qb.andWhere).toHaveBeenCalledWith('build.is_public = true');
    });

    it('should apply multiple filters', async () => {
      await service.findAll({
        search: 'healer',
        classId: 1,
        onlyPublic: true,
      });

      const qb = mockBuildRepo.createQueryBuilder();
      // 3 filtros + exclusão de rascunhos (sem authorId)
      expect(qb.andWhere).toHaveBeenCalledTimes(4);
    });

    it('should hide drafts unless filtering by author', async () => {
      const qb = mockBuildRepo.createQueryBuilder();
      const draftClause = "(build.status IS NULL OR build.status <> 'draft')";

      await service.findAll({});
      expect(qb.andWhere).toHaveBeenCalledWith(draftClause);

      qb.andWhere.mockClear();
      await service.findAll({ authorId: 1 });
      expect(qb.andWhere).not.toHaveBeenCalledWith(draftClause);
    });

    it('should filter by category and sort by popularity', async () => {
      const qb = mockBuildRepo.createQueryBuilder();
      await service.findAll({ category: 'ZvZ', sort: 'popular' });

      expect(qb.andWhere).toHaveBeenCalledWith('build.category = :category', {
        category: 'ZvZ',
      });
      expect(qb.orderBy).toHaveBeenCalledWith('build.vote_count', 'DESC');
    });
  });

  describe('findDeleted', () => {
    it('should return only deleted builds', async () => {
      const deletedBuild = { ...mockBuild, deleted_at: new Date() };
      mockBuildRepo.find.mockResolvedValue([deletedBuild]);

      const result = await service.findDeleted();

      expect(mockBuildRepo.find).toHaveBeenCalledWith({
        where: {},
        withDeleted: true,
        relations: [
          'class',
          'spec',
          'items',
          'guild',
          'author',
          'member',
          'member.user',
        ],
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('restore', () => {
    it('should restore a deleted build', async () => {
      mockBuildRepo.restore.mockResolvedValue({ affected: 1 });

      const result = await service.restore(1);

      expect(mockBuildRepo.restore).toHaveBeenCalledWith(1);
      expect(result).toEqual({ restored: true });
    });
  });

  describe('hardRemove', () => {
    it('should permanently delete a build', async () => {
      mockBuildRepo.findOne.mockResolvedValue(mockBuild);
      mockBuildRepo.remove.mockResolvedValue(mockBuild);

      const result = await service.hardRemove(1);

      expect(mockBuildRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true,
      });
      expect(mockBuildRepo.remove).toHaveBeenCalledWith(mockBuild);
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException if build not found', async () => {
      mockBuildRepo.findOne.mockResolvedValue(null);

      await expect(service.hardRemove(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
