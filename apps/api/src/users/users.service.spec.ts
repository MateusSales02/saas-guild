import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockUsersRepo: any;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password_hash: 'hashed_password',
    nickname: 'TestUser',
    role: 'leader',
    uid: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUsers: User[] = [
    mockUser,
    { ...mockUser, id: 2, email: 'test2@example.com', nickname: 'TestUser2' },
  ];

  beforeEach(async () => {
    mockUsersRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users without password_hash', async () => {
      mockUsersRepo.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockUsersRepo.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      result.forEach(user => {
        expect(user).not.toHaveProperty('password_hash');
      });
    });

    it('should return empty array if no users', async () => {
      mockUsersRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user without password_hash', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).not.toHaveProperty('password_hash');
      expect(result).toHaveProperty('email', mockUser.email);
    });

    it('should return null if user not found', async () => {
      mockUsersRepo.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user and return without password_hash', async () => {
      const userData = { email: 'new@example.com', nickname: 'NewUser' };
      mockUsersRepo.create.mockReturnValue({ ...mockUser, ...userData });
      mockUsersRepo.save.mockResolvedValue({ ...mockUser, ...userData });

      const result = await service.create(userData);

      expect(mockUsersRepo.create).toHaveBeenCalledWith(userData);
      expect(mockUsersRepo.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password_hash');
    });
  });

  describe('update', () => {
    it('should update a user and return without password_hash', async () => {
      const updateData = { nickname: 'UpdatedName' };
      mockUsersRepo.update.mockResolvedValue({ affected: 1 });
      mockUsersRepo.findOne.mockResolvedValue({ ...mockUser, ...updateData });

      const result = await service.update(1, updateData);

      expect(mockUsersRepo.update).toHaveBeenCalledWith(1, updateData);
      expect(result).not.toHaveProperty('password_hash');
      expect(result?.nickname).toBe('UpdatedName');
    });

    it('should return null if user not found after update', async () => {
      mockUsersRepo.update.mockResolvedValue({ affected: 0 });
      mockUsersRepo.findOne.mockResolvedValue(null);

      const result = await service.update(999, { nickname: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockUsersRepo.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockUsersRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('search', () => {
    it('should search users by email or nickname', async () => {
      mockUsersRepo.find.mockResolvedValue(mockUsers);

      const result = await service.search('test');

      expect(mockUsersRepo.find).toHaveBeenCalledWith({
        where: [
          { email: ILike('%test%') },
          { nickname: ILike('%test%') },
        ],
        order: { id: 'ASC' },
      });
      expect(result).toHaveLength(2);
      result.forEach(user => {
        expect(user).not.toHaveProperty('password_hash');
      });
    });

    it('should return empty array for empty search term', async () => {
      const result = await service.search('');

      expect(mockUsersRepo.find).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace search term', async () => {
      const result = await service.search('   ');

      expect(mockUsersRepo.find).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email (with password_hash)', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toHaveProperty('password_hash');
    });

    it('should return null if user not found', async () => {
      mockUsersRepo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });
});
