import { Test, TestingModule } from '@nestjs/testing';
import { AlbionService } from './albion.service';

global.fetch = jest.fn();

describe('AlbionService', () => {
  let service: AlbionService;
  let mockFetch: jest.Mock;

  beforeEach(async () => {
    mockFetch = global.fetch as jest.Mock;
    mockFetch.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AlbionService],
    }).compile();

    service = module.get<AlbionService>(AlbionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchStatus', () => {
    it('should fetch server status successfully', async () => {
      const mockData = [
        { server: 'Americas', status: 'online', population: 1500 },
        { server: 'Europe', status: 'online', population: 2000 },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await service.fetchStatus();

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when response is not an array', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'not an array' }),
      });

      const result = await service.fetchStatus();

      expect(result).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(service.fetchStatus()).rejects.toThrow(
        'Não foi possível consultar o status do Albion',
      );
    });
  });

  describe('fetchActivities', () => {
    it('should fetch activities with default limit', async () => {
      const mockActivities = [
        {
          EventId: 1,
          EventTime: '2024-01-01T00:00:00Z',
          KillerGuildName: 'Guild A',
          VictimGuildName: 'Guild B',
          TotalVictimKillFame: 1000,
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockActivities,
      });

      const result = await service.fetchActivities();

      expect(result).toEqual(mockActivities);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=5'),
      );
    });

    it('should fetch activities with custom limit', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await service.fetchActivities(10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
      );
    });

    it('should return empty array when response is not an array', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ error: 'not an array' }),
      });

      const result = await service.fetchActivities();

      expect(result).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(service.fetchActivities()).rejects.toThrow(
        'Não foi possível consultar atividades do Albion',
      );
    });
  });
});
