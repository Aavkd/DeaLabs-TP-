/**
 * @file Unit tests for dealManager
 */

import path from 'path';
import {
  createDeal,
  listDeals,
  getDealById,
  searchDeals,
  getTopHottest,
  getCategoryStats,
  calculateDiscount,
} from '../src/dealManager';
import { Deal, isSuccess, isError } from '../src/types';

// Mock storage path
const TEST_DATA_DIR = path.join(__dirname, 'test-data');
const TEST_DATA_FILE = path.join(TEST_DATA_DIR, 'deals.json');

// Mock the storage module
jest.mock('../src/storage', () => {
  let mockDeals: Deal[] = [];

  return {
    loadDeals: jest.fn(async () => mockDeals),
    saveDeals: jest.fn(async (deals: Deal[]) => {
      mockDeals = [...deals];
    }),
    seedDataIfEmpty: jest.fn(),
    getDataFilePath: jest.fn(() => TEST_DATA_FILE),
  };
});

// Mock logger to prevent console output during tests
jest.mock('../src/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn(),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('dealManager', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const storage = require('../src/storage');

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    storage.saveDeals.mockClear();
    storage.loadDeals.mockClear();
  });

  describe('createDeal', () => {
    it('should create a valid deal with temperature 0', async () => {
      const input = {
        title: 'Test Deal',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'Tech' as const,
      };

      const result = await createDeal(input);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.title).toBe('Test Deal');
        expect(result.value.temperature).toBe(0);
        expect(result.value.votesHot).toBe(0);
        expect(result.value.votesCold).toBe(0);
        expect(result.value.id).toBeDefined();
        expect(storage.saveDeals).toHaveBeenCalledTimes(1);
      }
    });

    it('should reject invalid title', async () => {
      const input = {
        title: 'ab',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'Tech' as const,
      };

      const result = await createDeal(input);

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error.message).toContain('at least 3 characters');
      }
    });

    it('should reject invalid price relationship', async () => {
      const input = {
        title: 'Test Deal',
        originalPrice: 80,
        discountedPrice: 100,
        url: 'https://example.com',
        category: 'Tech' as const,
      };

      const result = await createDeal(input);

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error.message).toContain('Discounted price must be less than original price');
      }
    });

    it('should reject invalid URL', async () => {
      const input = {
        title: 'Test Deal',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'not-a-url',
        category: 'Tech' as const,
      };

      const result = await createDeal(input);

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error.message).toContain('valid HTTP or HTTPS URL');
      }
    });

    it('should reject invalid category', async () => {
      const input = {
        title: 'Test Deal',
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'InvalidCategory' as any,
      };

      const result = await createDeal(input);

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error.message).toContain('Category must be one of');
      }
    });
  });

  describe('listDeals', () => {
    it('should return deals sorted by temperature descending', async () => {
      const mockDeals: Deal[] = [
        {
          id: '1',
          title: 'Deal 1',
          originalPrice: 100,
          discountedPrice: 80,
          url: 'https://example.com',
          category: 'Tech',
          temperature: 5,
          votesHot: 5,
          votesCold: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Deal 2',
          originalPrice: 100,
          discountedPrice: 80,
          url: 'https://example.com',
          category: 'Gaming',
          temperature: 10,
          votesHot: 10,
          votesCold: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Deal 3',
          originalPrice: 100,
          discountedPrice: 80,
          url: 'https://example.com',
          category: 'Home',
          temperature: -2,
          votesHot: 0,
          votesCold: 2,
          createdAt: new Date().toISOString(),
        },
      ];

      storage.loadDeals.mockResolvedValue(mockDeals);

      const result = await listDeals();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toHaveLength(3);
        expect(result.value[0]?.temperature).toBe(10);
        expect(result.value[1]?.temperature).toBe(5);
        expect(result.value[2]?.temperature).toBe(-2);
      }
    });

    it('should return empty array when no deals', async () => {
      storage.loadDeals.mockResolvedValue([]);

      const result = await listDeals();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe('getDealById', () => {
    it('should return deal when found', async () => {
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

      storage.loadDeals.mockResolvedValue([mockDeal]);

      const result = await getDealById('123');

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.id).toBe('123');
        expect(result.value.title).toBe('Test Deal');
      }
    });

    it('should return error when deal not found', async () => {
      storage.loadDeals.mockResolvedValue([]);

      const result = await getDealById('nonexistent');

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should return error when ID is empty', async () => {
      const result = await getDealById('');

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error.message).toContain('Deal ID is required');
      }
    });
  });

  describe('searchDeals', () => {
    const mockDeals: Deal[] = [
      {
        id: '1',
        title: 'Gaming Laptop',
        originalPrice: 1000,
        discountedPrice: 800,
        url: 'https://example.com',
        category: 'Tech',
        temperature: 5,
        votesHot: 5,
        votesCold: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Gaming Mouse',
        originalPrice: 50,
        discountedPrice: 30,
        url: 'https://example.com',
        category: 'Gaming',
        temperature: 3,
        votesHot: 3,
        votesCold: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Smart TV',
        originalPrice: 500,
        discountedPrice: 400,
        url: 'https://example.com',
        category: 'Home',
        temperature: 2,
        votesHot: 2,
        votesCold: 0,
        createdAt: new Date().toISOString(),
      },
    ];

    beforeEach(() => {
      storage.loadDeals.mockResolvedValue(mockDeals);
    });

    it('should filter by keyword (case-insensitive)', async () => {
      const result = await searchDeals('gaming');

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]?.title).toContain('Gaming');
        expect(result.value[1]?.title).toContain('Gaming');
      }
    });

    it('should filter by category', async () => {
      const result = await searchDeals(undefined, 'Tech');

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]?.category).toBe('Tech');
      }
    });

    it('should filter by both keyword and category', async () => {
      const result = await searchDeals('gaming', 'Gaming');

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]?.title).toBe('Gaming Mouse');
      }
    });

    it('should return sorted results', async () => {
      const result = await searchDeals('gaming');

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value[0]?.temperature).toBeGreaterThanOrEqual(
          result.value[1]?.temperature || 0
        );
      }
    });
  });

  describe('getTopHottest', () => {
    it('should return top 3 hottest deals', async () => {
      const mockDeals: Deal[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${i}`,
        title: `Deal ${i}`,
        originalPrice: 100,
        discountedPrice: 80,
        url: 'https://example.com',
        category: 'Tech',
        temperature: i,
        votesHot: i,
        votesCold: 0,
        createdAt: new Date().toISOString(),
      }));

      storage.loadDeals.mockResolvedValue(mockDeals);

      const result = await getTopHottest(3);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toHaveLength(3);
        expect(result.value[0]?.temperature).toBe(4);
        expect(result.value[1]?.temperature).toBe(3);
        expect(result.value[2]?.temperature).toBe(2);
      }
    });

    it('should handle limit greater than deal count', async () => {
      const mockDeals: Deal[] = [
        {
          id: '1',
          title: 'Deal 1',
          originalPrice: 100,
          discountedPrice: 80,
          url: 'https://example.com',
          category: 'Tech',
          temperature: 5,
          votesHot: 5,
          votesCold: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      storage.loadDeals.mockResolvedValue(mockDeals);

      const result = await getTopHottest(10);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toHaveLength(1);
      }
    });
  });

  describe('getCategoryStats', () => {
    it('should return count by category', async () => {
      const mockDeals: Deal[] = [
        {
          id: '1',
          title: 'Deal 1',
          originalPrice: 100,
          discountedPrice: 80,
          url: 'https://example.com',
          category: 'Tech',
          temperature: 0,
          votesHot: 0,
          votesCold: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Deal 2',
          originalPrice: 100,
          discountedPrice: 80,
          url: 'https://example.com',
          category: 'Tech',
          temperature: 0,
          votesHot: 0,
          votesCold: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Deal 3',
          originalPrice: 100,
          discountedPrice: 80,
          url: 'https://example.com',
          category: 'Gaming',
          temperature: 0,
          votesHot: 0,
          votesCold: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      storage.loadDeals.mockResolvedValue(mockDeals);

      const result = await getCategoryStats();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toHaveLength(2);
        const techStat = result.value.find((s) => s.category === 'Tech');
        const gamingStat = result.value.find((s) => s.category === 'Gaming');
        expect(techStat?.count).toBe(2);
        expect(gamingStat?.count).toBe(1);
      }
    });

    it('should return empty array when no deals', async () => {
      storage.loadDeals.mockResolvedValue([]);

      const result = await getCategoryStats();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discount percentage correctly', () => {
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

      expect(calculateDiscount(deal)).toBe(20);
    });

    it('should handle zero original price', () => {
      const deal: Deal = {
        id: '1',
        title: 'Test',
        originalPrice: 0,
        discountedPrice: 0,
        url: 'https://example.com',
        category: 'Tech',
        temperature: 0,
        votesHot: 0,
        votesCold: 0,
        createdAt: new Date().toISOString(),
      };

      expect(calculateDiscount(deal)).toBe(0);
    });

    it('should round to 2 decimals', () => {
      const deal: Deal = {
        id: '1',
        title: 'Test',
        originalPrice: 99,
        discountedPrice: 66,
        url: 'https://example.com',
        category: 'Tech',
        temperature: 0,
        votesHot: 0,
        votesCold: 0,
        createdAt: new Date().toISOString(),
      };

      const discount = calculateDiscount(deal);
      expect(discount).toBe(33.33);
    });
  });
});
