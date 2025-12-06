import { Test, TestingModule } from '@nestjs/testing';
import { DiscordService } from './discord.service';

global.fetch = jest.fn();

describe('DiscordService', () => {
  let service: DiscordService;
  let mockFetch: jest.Mock;
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...originalEnv };
    mockFetch = global.fetch as jest.Mock;
    mockFetch.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordService],
    }).compile();

    service = module.get<DiscordService>(DiscordService);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWebhook', () => {
    it('should send webhook successfully when URL is configured', async () => {
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';

      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const module = await Test.createTestingModule({
        providers: [DiscordService],
      }).compile();
      const testService = module.get<DiscordService>(DiscordService);

      const result = await testService.sendWebhook('Test message');

      expect(result.ok).toBe(true);
      expect(result.message).toBe('Test message');
      expect(result.sentAt).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://discord.com/api/webhooks/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'Test message' }),
        }),
      );
    });

    it('should return error when webhook URL is not configured', async () => {
      delete process.env.DISCORD_WEBHOOK_URL;

      const module = await Test.createTestingModule({
        providers: [DiscordService],
      }).compile();
      const testService = module.get<DiscordService>(DiscordService);

      const result = await testService.sendWebhook('Test message');

      expect(result.ok).toBe(false);
      expect(result.message).toBe('Webhook não configurada');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw error when webhook request fails', async () => {
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
      });

      const module = await Test.createTestingModule({
        providers: [DiscordService],
      }).compile();
      const testService = module.get<DiscordService>(DiscordService);

      await expect(testService.sendWebhook('Test message')).rejects.toThrow(
        'Não foi possível enviar a notificação ao Discord',
      );
    });
  });
});
