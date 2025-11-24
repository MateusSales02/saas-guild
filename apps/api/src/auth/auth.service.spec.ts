import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { GuildsService } from '../guilds/guilds.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersRepo: any;
  let mockJwtService: any;
  let mockGuildsService: any;

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

  const mockGuild = {
    id: 1,
    name: 'Guilda de TestUser',
    created_at: new Date(),
  };

  beforeEach(async () => {
    mockUsersRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock_token'),
    };

    mockGuildsService = {
      createGuildWithLeader: jest.fn().mockResolvedValue(mockGuild),
      findByMember: jest.fn().mockResolvedValue([mockGuild]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: GuildsService,
          useValue: mockGuildsService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'password123',
      nickname: 'NewUser',
    };

    it('should register a new user successfully', async () => {
      mockUsersRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersRepo.create.mockReturnValue({ ...mockUser, email: registerDto.email });
      mockUsersRepo.save.mockResolvedValue({ ...mockUser, email: registerDto.email, id: 1 });

      const result = await service.register(registerDto);

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(mockUsersRepo.create).toHaveBeenCalled();
      expect(mockUsersRepo.save).toHaveBeenCalled();
      expect(mockGuildsService.createGuildWithLeader).toHaveBeenCalledWith(1, registerDto.nickname);
      expect(result).toHaveProperty('token', 'mock_token');
      expect(result).toHaveProperty('guild');
      expect(result.guild).toHaveProperty('id', 1);
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
      await expect(service.register(registerDto)).rejects.toThrow('E-mail já cadastrado');
    });

    it('should create user with leader role', async () => {
      mockUsersRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersRepo.create.mockReturnValue(mockUser);
      mockUsersRepo.save.mockResolvedValue(mockUser);

      await service.register(registerDto);

      expect(mockUsersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'leader' })
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith({ where: { email: loginDto.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password_hash);
      expect(mockGuildsService.findByMember).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty('token', 'mock_token');
      expect(result).toHaveProperty('guild');
      expect(result.guild).toHaveProperty('id', 1);
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersRepo.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('createPlayer', () => {
    it('should create a player successfully', async () => {
      const playerData = {
        email: 'player@example.com',
        password: 'password123',
        nickname: 'Player1',
      };
      const playerUser = { ...mockUser, email: playerData.email, role: 'player' };

      mockUsersRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersRepo.create.mockReturnValue(playerUser);
      mockUsersRepo.save.mockResolvedValue(playerUser);

      const result = await service.createPlayer(playerData.email, playerData.password, playerData.nickname);

      expect(mockUsersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'player' })
      );
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.createPlayer('test@example.com', 'password', 'Player')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return user without password_hash', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).not.toHaveProperty('password_hash');
      expect(result).toHaveProperty('email', mockUser.email);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findById(999)).rejects.toThrow('Usuário não encontrado');
    });
  });
});
