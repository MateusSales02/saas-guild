import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { GuildsService } from '../guilds/guilds.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { EmailService } from '../email/email.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersRepo: any;
  let mockResetTokenRepo: any;
  let mockJwtService: any;
  let mockGuildsService: any;
  let mockEmailService: any;

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
      update: jest.fn(),
    };

    mockResetTokenRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock_token'),
    };

    mockGuildsService = {
      createGuildWithLeader: jest.fn().mockResolvedValue(mockGuild),
      findByMember: jest.fn().mockResolvedValue([mockGuild]),
    };

    mockEmailService = {
      sendPasswordResetEmail: jest
        .fn()
        .mockResolvedValue({ sent: false, token: 'mock_reset_token' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepo,
        },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: mockResetTokenRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: GuildsService,
          useValue: mockGuildsService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
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
      mockUsersRepo.create.mockReturnValue({
        ...mockUser,
        email: registerDto.email,
      });
      mockUsersRepo.save.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        id: 1,
      });

      const result = await service.register(registerDto);

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(mockUsersRepo.create).toHaveBeenCalled();
      expect(mockUsersRepo.save).toHaveBeenCalled();
      expect(mockGuildsService.createGuildWithLeader).toHaveBeenCalledWith(
        1,
        registerDto.nickname,
      );
      expect(result).toHaveProperty('token', 'mock_token');
      expect(result).toHaveProperty('guild');
      expect(result.guild).toHaveProperty('id', 1);
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'E-mail já cadastrado',
      );
    });

    it('should create user with leader role', async () => {
      mockUsersRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersRepo.create.mockReturnValue(mockUser);
      mockUsersRepo.save.mockResolvedValue(mockUser);

      await service.register(registerDto);

      expect(mockUsersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'leader' }),
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

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password_hash,
      );
      expect(mockGuildsService.findByMember).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty('token', 'mock_token');
      expect(result).toHaveProperty('guild');
      expect(result.guild).toHaveProperty('id', 1);
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersRepo.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });
  });

  describe('createPlayer', () => {
    it('should create a player successfully', async () => {
      const playerData = {
        email: 'player@example.com',
        password: 'password123',
        nickname: 'Player1',
      };
      const playerUser = {
        ...mockUser,
        email: playerData.email,
        role: 'player',
      };

      mockUsersRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersRepo.create.mockReturnValue(playerUser);
      mockUsersRepo.save.mockResolvedValue(playerUser);

      const result = await service.createPlayer(
        playerData.email,
        playerData.password,
        playerData.nickname,
      );

      expect(mockUsersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'player' }),
      );
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.createPlayer('test@example.com', 'password', 'Player'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createPlayerSimple', () => {
    it('should create a player with auto-generated email and password', async () => {
      const nickname = 'TestPlayer';
      const playerUser = {
        ...mockUser,
        email: 'testplayer@guild.local',
        role: 'player',
      };

      mockUsersRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersRepo.create.mockReturnValue(playerUser);
      mockUsersRepo.save.mockResolvedValue(playerUser);

      const result = await service.createPlayerSimple(nickname);

      expect(mockUsersRepo.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password_hash');
      expect(result.email).toContain('@guild.local');
    });

    it('should increment counter if generated email already exists', async () => {
      const nickname = 'TestPlayer';
      const playerUser = {
        ...mockUser,
        email: 'testplayer1@guild.local',
        role: 'player',
      };

      // Primeira tentativa: email já existe no loop
      // Segunda tentativa: email está livre (sai do loop)
      // Terceira chamada: dentro de createPlayer() para verificar se email está disponível
      mockUsersRepo.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersRepo.create.mockReturnValue(playerUser);
      mockUsersRepo.save.mockResolvedValue(playerUser);

      const result = await service.createPlayerSimple(nickname);

      expect(mockUsersRepo.findOne).toHaveBeenCalledTimes(3);
      expect(result).not.toHaveProperty('password_hash');
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
      await expect(service.findById(999)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });
  });

  describe('forgotPassword', () => {
    it('should create reset token and send email when user exists', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);
      mockResetTokenRepo.update.mockResolvedValue({ affected: 0 });
      mockResetTokenRepo.save.mockResolvedValue({
        id: 1,
        token: 'reset-token-123',
        user: mockUser,
        expiresAt: new Date(),
        used: false,
      });
      mockEmailService.sendPasswordResetEmail.mockResolvedValue({
        sent: true,
      });

      const result = await service.forgotPassword('test@example.com');

      expect(mockUsersRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockResetTokenRepo.update).toHaveBeenCalledWith(
        { user: { id: mockUser.id }, used: false },
        { used: true },
      );
      expect(mockResetTokenRepo.save).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.any(String),
      );
      expect(result.message).toBe(
        'Se o email existir, você receberá um link de recuperação de senha.',
      );
      expect(result.token).toBeUndefined();
    });

    it('should return token when email sending fails', async () => {
      mockUsersRepo.findOne.mockResolvedValue(mockUser);
      mockResetTokenRepo.update.mockResolvedValue({ affected: 0 });
      mockResetTokenRepo.save.mockResolvedValue({
        id: 1,
        token: 'reset-token-123',
        user: mockUser,
        expiresAt: new Date(),
        used: false,
      });
      mockEmailService.sendPasswordResetEmail.mockResolvedValue({
        sent: false,
        token: 'reset-token-123',
      });

      const result = await service.forgotPassword('test@example.com');

      expect(result.token).toBe('reset-token-123');
    });

    it('should return success message when user not found', async () => {
      mockUsersRepo.findOne.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result.message).toBe(
        'Se o email existir, você receberá um link de recuperação de senha.',
      );
      expect(result.token).toBeUndefined();
      expect(mockResetTokenRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const mockResetToken = {
      id: 1,
      token: 'valid-token',
      user: mockUser,
      expiresAt: new Date(Date.now() + 3600000),
      used: false,
    };

    it('should reset password with valid token', async () => {
      mockResetTokenRepo.findOne.mockResolvedValue(mockResetToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      mockUsersRepo.update.mockResolvedValue({ affected: 1 });
      mockResetTokenRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.resetPassword('valid-token', 'newPassword123');

      expect(mockResetTokenRepo.findOne).toHaveBeenCalledWith({
        where: { token: 'valid-token', used: false },
        relations: ['user'],
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 12);
      expect(mockUsersRepo.update).toHaveBeenCalledWith(mockUser.id, {
        password_hash: 'new_hashed_password',
      });
      expect(mockResetTokenRepo.update).toHaveBeenCalledWith(1, { used: true });
      expect(result.message).toBe(
        'Senha alterada com sucesso! Você já pode fazer login.',
      );
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockResetTokenRepo.findOne.mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid-token', 'newPassword'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.resetPassword('invalid-token', 'newPassword'),
      ).rejects.toThrow('Token inválido ou já utilizado');
    });

    it('should throw BadRequestException for expired token', async () => {
      const expiredToken = {
        ...mockResetToken,
        expiresAt: new Date(Date.now() - 3600000),
      };
      mockResetTokenRepo.findOne.mockResolvedValue(expiredToken);

      await expect(
        service.resetPassword('expired-token', 'newPassword'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.resetPassword('expired-token', 'newPassword'),
      ).rejects.toThrow('Token expirado');
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens and return count', async () => {
      mockResetTokenRepo.delete.mockResolvedValue({ affected: 5 });

      const result = await service.cleanupExpiredTokens();

      expect(mockResetTokenRepo.delete).toHaveBeenCalledWith({
        expiresAt: expect.any(Object),
      });
      expect(result).toBe(5);
    });

    it('should return 0 when no tokens deleted', async () => {
      mockResetTokenRepo.delete.mockResolvedValue({ affected: 0 });

      const result = await service.cleanupExpiredTokens();

      expect(result).toBe(0);
    });
  });
});
