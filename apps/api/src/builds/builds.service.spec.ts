import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { BuildsService } from './builds.service';
import { Build } from './build.entity';
import { BuildClass } from './build-class.entity';
import { BuildSpec } from './build-spec.entity';
import { BuildItem } from './build-item.entity';
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

  describe('remove', () => {
    it('should remove a build', async () => {
      mockBuildRepo.findOne.mockResolvedValue(mockBuild);
      mockBuildRepo.remove.mockResolvedValue(mockBuild);

      const result = await service.remove(1);

      expect(mockBuildRepo.remove).toHaveBeenCalledWith(mockBuild);
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('Classes', () => {
    describe('listClasses', () => {
      it('should return all classes', async () => {
        mockClassRepo.find.mockResolvedValue([mockClass]);

        const result = await service.listClasses();

        expect(mockClassRepo.find).toHaveBeenCalledWith({
          order: { name: 'ASC' },
        });
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
        mockItemRepo.find.mockResolvedValue([mockItem]);

        const result = await service.listItems();

        expect(mockItemRepo.find).toHaveBeenCalledWith({
          order: { name: 'ASC' },
        });
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

        expect(result).toEqual(mockItem);
      });
    });

    describe('removeItem', () => {
      it('should delete an item', async () => {
        mockItemRepo.delete.mockResolvedValue({ affected: 1 });

        const result = await service.removeItem(1);

        expect(result).toEqual({ deleted: true });
      });
    });
  });

  describe('seedDefaults', () => {
    it('should seed default data if empty', async () => {
      mockClassRepo.count.mockResolvedValue(0);
      mockClassRepo.create.mockImplementation((data) => data);
      mockClassRepo.save.mockResolvedValue([mockClass]);
      mockSpecRepo.create.mockImplementation((data) => data);
      mockSpecRepo.save.mockResolvedValue([mockSpec]);
      mockItemRepo.create.mockImplementation((data) => data);
      mockItemRepo.save.mockResolvedValue([mockItem]);
      mockBuildRepo.create.mockReturnValue(mockBuild);
      mockBuildRepo.save.mockResolvedValue(mockBuild);

      await service.seedDefaults();

      expect(mockClassRepo.save).toHaveBeenCalled();
    });

    it('should not seed if data already exists', async () => {
      mockClassRepo.count.mockResolvedValue(5);

      await service.seedDefaults();

      expect(mockClassRepo.save).not.toHaveBeenCalled();
    });
  });
});
