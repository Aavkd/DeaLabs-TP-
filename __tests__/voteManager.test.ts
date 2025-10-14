/**
 * @file Unit tests for voteManager
 */

import { voteHot, voteCold, calculateTemperature, getVoteStats } from '../src/voteManager';
import { Deal, isSuccess, isError } from '../src/types';

// Mock storage
jest.mock('../src/storage', () => {
  let mockDeals: Deal[] = [];

  return {
    loadDeals: jest.fn(async () => mockDeals),
    saveDeals: jest.fn(async (deals: Deal[]) => {
      mockDeals = [...deals];
    }),
    __setMockDeals: (deals: Deal[]) => {
      mockDeals = [...deals];
    },
    __getMockDeals: () => mockDeals,
  };
});

// Mock logger
jest.mock('../src/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn(),
}));

describe('voteManager', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const storage = require('../src/storage');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateTemperature', () => {
    it('should calculate temperature correctly', () => {
      expect(calculateTemperature(10, 5)).toBe(5);
      expect(calculateTemperature(5, 10)).toBe(-5);
      expect(calculateTemperature(0, 0)).toBe(0);
    });
  });

  describe('voteHot', () => {
    it('should increase votesHot and temperature by 1', async () => {
      const mockDeal: Deal = {
        id: '123',
        title: 'Test Deal',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'Tech',
        temperature: 0,
        votesHot: 0,
        votesCold: 0,
        createdAt: new Date().toISOString(),
      };

      storage.__setMockDeals([mockDeal]);

      const result = await voteHot('123');

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.votesHot).toBe(1);
        expect(result.value.votesCold).toBe(0);
        expect(result.value.temperature).toBe(1);
      }
    });

    it('should handle multiple hot votes', async () => {
      const mockDeal: Deal = {
        id: '123',
        title: 'Test Deal',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'Tech',
        temperature: 5,
        votesHot: 5,
        votesCold: 0,
        createdAt: new Date().toISOString(),
      };

      storage.__setMockDeals([mockDeal]);

      const result = await voteHot('123');

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.votesHot).toBe(6);
        expect(result.value.temperature).toBe(6);
      }
    });

    it('should return error when deal not found', async () => {
      storage.__setMockDeals([]);

      const result = await voteHot('nonexistent');

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should return error when ID is empty', async () => {
      const result = await voteHot('');

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error.message).toContain('Deal ID is required');
      }
    });
  });

  describe('voteCold', () => {
    it('should increase votesCold and decrease temperature by 1', async () => {
      const mockDeal: Deal = {
        id: '123',
        title: 'Test Deal',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'Tech',
        temperature: 0,
        votesHot: 0,
        votesCold: 0,
        createdAt: new Date().toISOString(),
      };

      storage.__setMockDeals([mockDeal]);

      const result = await voteCold('123');

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.votesHot).toBe(0);
        expect(result.value.votesCold).toBe(1);
        expect(result.value.temperature).toBe(-1);
      }
    });

    it('should handle mixed votes correctly', async () => {
      const mockDeal: Deal = {
        id: '123',
        title: 'Test Deal',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'Tech',
        temperature: 3,
        votesHot: 5,
        votesCold: 2,
        createdAt: new Date().toISOString(),
      };

      storage.__setMockDeals([mockDeal]);

      const result = await voteCold('123');

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.votesHot).toBe(5);
        expect(result.value.votesCold).toBe(3);
        expect(result.value.temperature).toBe(2);
      }
    });

    it('should return error when deal not found', async () => {
      storage.__setMockDeals([]);

      const result = await voteCold('nonexistent');

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error.message).toContain('not found');
      }
    });
  });

  describe('getVoteStats', () => {
    it('should calculate vote statistics correctly', () => {
      const deal: Deal = {
        id: '1',
        title: 'Test',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'Tech',
        temperature: 5,
        votesHot: 8,
        votesCold: 3,
        createdAt: new Date().toISOString(),
      };

      const stats = getVoteStats(deal);

      expect(stats.votesHot).toBe(8);
      expect(stats.votesCold).toBe(3);
      expect(stats.totalVotes).toBe(11);
      expect(stats.temperature).toBe(5);
      expect(stats.hotPercentage).toBeCloseTo(72.73, 1);
    });

    it('should handle zero votes', () => {
      const deal: Deal = {
        id: '1',
        title: 'Test',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'Tech',
        temperature: 0,
        votesHot: 0,
        votesCold: 0,
        createdAt: new Date().toISOString(),
      };

      const stats = getVoteStats(deal);

      expect(stats.totalVotes).toBe(0);
      expect(stats.hotPercentage).toBe(0);
    });

    it('should handle 100% hot votes', () => {
      const deal: Deal = {
        id: '1',
        title: 'Test',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'Tech',
        temperature: 10,
        votesHot: 10,
        votesCold: 0,
        createdAt: new Date().toISOString(),
      };

      const stats = getVoteStats(deal);

      expect(stats.hotPercentage).toBe(100);
    });

    it('should handle 0% hot votes', () => {
      const deal: Deal = {
        id: '1',
        title: 'Test',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'Tech',
        temperature: -5,
        votesHot: 0,
        votesCold: 5,
        createdAt: new Date().toISOString(),
      };

      const stats = getVoteStats(deal);

      expect(stats.hotPercentage).toBe(0);
    });
  });
});
