import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let mockTransporter: any;

  const defaultConfig: Record<string, any> = {
    SMTP_HOST: 'smtp.example.com',
    SMTP_USER: 'test@example.com',
    SMTP_PASSWORD: 'password123',
    SMTP_PORT: 587,
    SMTP_SECURE: false,
    SMTP_FROM: '"Test" <noreply@test.com>',
    FRONTEND_URL: 'http://localhost:3000',
  };

  const createTestModule = async (config = defaultConfig) => {
    mockTransporter = { sendMail: jest.fn() };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) =>
              config[key] ?? defaultValue
            ),
          },
        },
      ],
    }).compile();

    return module.get<EmailService>(EmailService);
  };

  beforeEach(async () => {
    service = await createTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create transporter when SMTP credentials are provided', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password123',
        },
      });
    });

    it('should disable email service when SMTP credentials are missing', async () => {
      const disabledService = await createTestModule({});
      const result = await disabledService.sendPasswordResetEmail(
        'test@test.com',
        'token123',
      );

      expect(result.sent).toBe(false);
      expect(result.token).toBe('token123');
    });
  });

  describe('sendPasswordResetEmail', () => {
    beforeEach(() => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });
    });

    it('should send password reset email successfully', async () => {
      const result = await service.sendPasswordResetEmail(
        'user@test.com',
        'reset-token-123',
      );

      expect(result.sent).toBe(true);
      expect(result.token).toBeUndefined();
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"Test" <noreply@test.com>',
          to: 'user@test.com',
          subject: 'Recuperação de Senha - Guild Mesh',
          html: expect.stringContaining('reset-token-123'),
        }),
      );
    });

    it('should use default frontend URL when not configured', async () => {
      const configWithoutUrl = { ...defaultConfig };
      delete configWithoutUrl.FRONTEND_URL;
      const testService = await createTestModule(configWithoutUrl);

      await testService.sendPasswordResetEmail('user@test.com', 'token-xyz');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('https://guildmesh.duckdns.org'),
        }),
      );
    });

    it('should return token when email sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP failed'));

      const result = await service.sendPasswordResetEmail(
        'user@test.com',
        'failed-token',
      );

      expect(result.sent).toBe(false);
      expect(result.token).toBe('failed-token');
    });

    it('should return token in dev mode when service is disabled', async () => {
      const devService = await createTestModule({});
      const result = await devService.sendPasswordResetEmail(
        'dev@test.com',
        'dev-token-123',
      );

      expect(result.sent).toBe(false);
      expect(result.token).toBe('dev-token-123');
    });

    it.each([
      ['Guild Mesh', 'branding'],
      ['Resetar Minha Senha', 'reset button'],
      ['Não solicitou esta alteração', 'security warning'],
      [new Date().getFullYear().toString(), 'current year'],
    ])('should include %s in email (%s)', async (expectedContent) => {
      await service.sendPasswordResetEmail('user@test.com', 'token');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(expectedContent),
        }),
      );
    });
  });
});
