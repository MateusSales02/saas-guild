import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let mockTransporter: any;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn(),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                SMTP_HOST: 'smtp.example.com',
                SMTP_USER: 'test@example.com',
                SMTP_PASSWORD: 'password123',
                SMTP_PORT: 587,
                SMTP_SECURE: false,
                SMTP_FROM: '"Test" <noreply@test.com>',
                FRONTEND_URL: 'http://localhost:3000',
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
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
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => {
                return defaultValue;
              }),
            },
          },
        ],
      }).compile();

      const disabledService = module.get<EmailService>(EmailService);
      const result = await disabledService.sendPasswordResetEmail(
        'test@test.com',
        'token123',
      );

      expect(result.sent).toBe(false);
      expect(result.token).toBe('token123');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

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

    it('should include reset link in email template', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await service.sendPasswordResetEmail('user@test.com', 'token-abc');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(
            'http://localhost:3000/reset-password?token=token-abc',
          ),
        }),
      );
    });

    it('should use default frontend URL when not configured', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => {
                const config: Record<string, any> = {
                  SMTP_HOST: 'smtp.example.com',
                  SMTP_USER: 'test@example.com',
                  SMTP_PASSWORD: 'password123',
                  SMTP_PORT: 587,
                  SMTP_FROM: '"Test" <noreply@test.com>',
                };
                return config[key] ?? defaultValue;
              }),
            },
          },
        ],
      }).compile();

      const testService = module.get<EmailService>(EmailService);
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await testService.sendPasswordResetEmail('user@test.com', 'token-xyz');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(
            'http://guildmesh.duckdns.org/reset-password?token=token-xyz',
          ),
        }),
      );
    });

    it('should return token when email sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValue(
        new Error('SMTP connection failed'),
      );

      const result = await service.sendPasswordResetEmail(
        'user@test.com',
        'failed-token',
      );

      expect(result.sent).toBe(false);
      expect(result.token).toBe('failed-token');
    });

    it('should handle SMTP errors gracefully', async () => {
      const smtpError = {
        name: 'SMTPError',
        message: 'Invalid login',
        code: 'EAUTH',
        command: 'AUTH',
        response: '535 Authentication failed',
        responseCode: 535,
      };

      mockTransporter.sendMail.mockRejectedValue(smtpError);

      const result = await service.sendPasswordResetEmail(
        'user@test.com',
        'error-token',
      );

      expect(result.sent).toBe(false);
      expect(result.token).toBe('error-token');
    });

    it('should return token in dev mode when service is disabled', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(),
            },
          },
        ],
      }).compile();

      const devService = module.get<EmailService>(EmailService);
      const result = await devService.sendPasswordResetEmail(
        'dev@test.com',
        'dev-token-123',
      );

      expect(result.sent).toBe(false);
      expect(result.token).toBe('dev-token-123');
    });

    it('should include Guild Mesh branding in email', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await service.sendPasswordResetEmail('user@test.com', 'token');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Guild Mesh'),
        }),
      );
    });

    it('should include password reset button in email', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await service.sendPasswordResetEmail('user@test.com', 'token');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Resetar Minha Senha'),
        }),
      );
    });

    it('should include security warning in email', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await service.sendPasswordResetEmail('user@test.com', 'token');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Não solicitou esta alteração'),
        }),
      );
    });

    it('should include current year in footer', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      const currentYear = new Date().getFullYear();
      await service.sendPasswordResetEmail('user@test.com', 'token');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(currentYear.toString()),
        }),
      );
    });
  });
});
