import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsService } from './integrations.service';
import { AlbionService } from './albion.service';
import { DiscordService } from './discord.service';

describe('IntegrationsService', () => {
  let service: IntegrationsService;
  let mockAlbionService: any;
  let mockDiscordService: any;

  const mockServers = [
    { server: 'West', status: 'online', population: 'High' },
    { server: 'East', status: 'online', population: 'Medium' },
  ];

  const mockActivities = [
    { type: 'pvp', count: 1500, region: 'Blackzone' },
    { type: 'pve', count: 3000, region: 'Royals' },
  ];

  beforeEach(async () => {
    mockAlbionService = {
      fetchStatus: jest.fn().mockResolvedValue(mockServers),
      fetchActivities: jest.fn().mockResolvedValue(mockActivities),
    };

    mockDiscordService = {
      sendWebhook: jest.fn().mockResolvedValue({ success: true, messageId: '123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        { provide: AlbionService, useValue: mockAlbionService },
        { provide: DiscordService, useValue: mockDiscordService },
      ],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);

    // Wait for constructor async call to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAlbionSnapshot', () => {
    it('should return cached snapshot', () => {
      const result = service.getAlbionSnapshot();

      expect(result).toHaveProperty('servers');
      expect(result).toHaveProperty('activities');
      expect(result).toHaveProperty('lastUpdated');
    });

    it('should return snapshot with data after refresh', async () => {
      await service.refreshAlbion();

      const result = service.getAlbionSnapshot();

      expect(result.servers).toEqual(mockServers);
      expect(result.activities).toEqual(mockActivities);
    });
  });

  describe('refreshAlbion', () => {
    it('should fetch server status and activities', async () => {
      const result = await service.refreshAlbion();

      expect(mockAlbionService.fetchStatus).toHaveBeenCalled();
      expect(mockAlbionService.fetchActivities).toHaveBeenCalled();
      expect(result.servers).toEqual(mockServers);
      expect(result.activities).toEqual(mockActivities);
      expect(result.lastUpdated).toBeDefined();
    });

    it('should update cache after refresh', async () => {
      const newServers = [{ server: 'New', status: 'online', population: 'Low' }];
      mockAlbionService.fetchStatus.mockResolvedValue(newServers);

      await service.refreshAlbion();

      const snapshot = service.getAlbionSnapshot();
      expect(snapshot.servers).toEqual(newServers);
    });

    it('should handle fetch errors', async () => {
      mockAlbionService.fetchStatus.mockRejectedValue(new Error('API Error'));

      await expect(service.refreshAlbion()).rejects.toThrow('API Error');
    });
  });

  describe('pollAlbionStatus', () => {
    it('should call refreshAlbion', async () => {
      const refreshSpy = jest.spyOn(service, 'refreshAlbion');

      await service.pollAlbionStatus();

      expect(refreshSpy).toHaveBeenCalled();
    });

    it('should not throw on error', async () => {
      mockAlbionService.fetchStatus.mockRejectedValue(new Error('API Error'));

      await expect(service.pollAlbionStatus()).resolves.not.toThrow();
    });
  });

  describe('notifyDiscord', () => {
    it('should send notification via Discord webhook', async () => {
      const content = 'Test notification message';

      const result = await service.notifyDiscord(content);

      expect(mockDiscordService.sendWebhook).toHaveBeenCalledWith(content);
      expect(result).toEqual({ success: true, messageId: '123' });
    });

    it('should store last notification result', async () => {
      const expectedResult = { success: true, messageId: '456', sentAt: new Date().toISOString() };
      mockDiscordService.sendWebhook.mockResolvedValue(expectedResult);

      await service.notifyDiscord('Test message');

      const lastNotification = service.getLastDiscordNotification();
      expect(lastNotification).toEqual(expectedResult);
    });

    it('should handle webhook errors', async () => {
      mockDiscordService.sendWebhook.mockRejectedValue(new Error('Webhook failed'));

      await expect(service.notifyDiscord('Test')).rejects.toThrow('Webhook failed');
    });
  });

  describe('getLastDiscordNotification', () => {
    it('should return undefined initially', () => {
      // Create a new instance without sending notifications
      const freshService = Object.create(IntegrationsService.prototype);
      freshService.lastDiscordNotification = undefined;

      expect(freshService.getLastDiscordNotification()).toBeUndefined();
    });

    it('should return last notification after sending', async () => {
      const expectedResult = { success: true, messageId: '789' };
      mockDiscordService.sendWebhook.mockResolvedValue(expectedResult);

      await service.notifyDiscord('Test');

      expect(service.getLastDiscordNotification()).toEqual(expectedResult);
    });
  });
});
