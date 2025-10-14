/**
 * @file Deal management business logic
 * @description Core functionality for creating, listing, searching, and analyzing deals
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Deal,
  CreateDealInput,
  Result,
  success,
  failure,
  CategoryValue,
  CategoryStats,
} from './types';
import { loadDeals, saveDeals } from './storage';
import {
  validateTitle,
  validatePriceRelationship,
  validateUrl,
  validateCategory,
  validateKeyword,
  sanitizeString,
} from './validators';
import { logInfo, logError, logDebug } from './logger';

/**
 * Creates a new deal and persists it
 * @param input - Deal creation input data
 * @returns Result containing the created deal or an error
 */
export async function createDeal(input: CreateDealInput): Promise<Result<Deal>> {
  try {
    // Validate all inputs
    validateTitle(input.title);
    validatePriceRelationship(input.originalPrice, input.discountedPrice);
    validateUrl(input.url);
    validateCategory(input.category);

    // Create new deal
    const newDeal: Deal = {
      id: uuidv4(),
      title: sanitizeString(input.title),
      originalPrice: input.originalPrice,
      discountedPrice: input.discountedPrice,
      url: sanitizeString(input.url),
      category: input.category,
      temperature: 0,
      votesHot: 0,
      votesCold: 0,
      createdAt: new Date().toISOString(),
    };

    // Load existing deals and add new one
    const deals = await loadDeals();
    deals.push(newDeal);
    await saveDeals(deals);

    logInfo('Deal created successfully', { id: newDeal.id, title: newDeal.title });
    return success(newDeal);
  } catch (error) {
    logError('Failed to create deal', error as Error);
    return failure(error as Error);
  }
}

/**
 * Lists all deals sorted by temperature (descending)
 * @returns Result containing array of deals sorted by temperature or an error
 */
export async function listDeals(): Promise<Result<Deal[]>> {
  try {
    const deals = await loadDeals();
    const sorted = deals.sort((a, b) => b.temperature - a.temperature);

    logDebug('Deals listed', { count: sorted.length });
    return success(sorted);
  } catch (error) {
    logError('Failed to list deals', error as Error);
    return failure(error as Error);
  }
}

/**
 * Gets a single deal by ID
 * @param id - The deal ID
 * @returns Result containing the deal or an error
 */
export async function getDealById(id: string): Promise<Result<Deal>> {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Deal ID is required');
    }

    const deals = await loadDeals();
    const deal = deals.find((d) => d.id === id);

    if (!deal) {
      throw new Error(`Deal with ID ${id} not found`);
    }

    logDebug('Deal retrieved', { id: deal.id });
    return success(deal);
  } catch (error) {
    logError('Failed to get deal by ID', error as Error);
    return failure(error as Error);
  }
}

/**
 * Searches deals by keyword in title or by category
 * @param keyword - Optional keyword to search in titles
 * @param category - Optional category filter
 * @returns Result containing filtered deals sorted by temperature or an error
 */
export async function searchDeals(
  keyword?: string,
  category?: CategoryValue
): Promise<Result<Deal[]>> {
  try {
    // Validate inputs if provided
    if (keyword) {
      validateKeyword(keyword);
    }
    if (category) {
      validateCategory(category);
    }

    const deals = await loadDeals();
    let filtered = deals;

    // Filter by keyword (case-insensitive)
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter((deal) => deal.title.toLowerCase().includes(lowerKeyword));
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter((deal) => deal.category === category);
    }

    // Sort by temperature
    const sorted = filtered.sort((a, b) => b.temperature - a.temperature);

    logDebug('Deals searched', {
      keyword,
      category,
      resultsCount: sorted.length,
    });

    return success(sorted);
  } catch (error) {
    logError('Failed to search deals', error as Error);
    return failure(error as Error);
  }
}

/**
 * Gets the top N hottest deals
 * @param limit - Number of deals to return (default: 3)
 * @returns Result containing top deals or an error
 */
export async function getTopHottest(limit = 3): Promise<Result<Deal[]>> {
  try {
    if (typeof limit !== 'number' || limit < 1) {
      throw new Error('Limit must be a positive number');
    }

    const deals = await loadDeals();
    const sorted = deals.sort((a, b) => b.temperature - a.temperature);
    const top = sorted.slice(0, limit);

    logInfo('Top hottest deals retrieved', { limit, count: top.length });
    return success(top);
  } catch (error) {
    logError('Failed to get top hottest deals', error as Error);
    return failure(error as Error);
  }
}

/**
 * Gets deal count by category
 * @returns Result containing category statistics or an error
 */
export async function getCategoryStats(): Promise<Result<CategoryStats[]>> {
  try {
    const deals = await loadDeals();

    // Count deals per category
    const categoryMap = new Map<CategoryValue, number>();
    deals.forEach((deal) => {
      const count = categoryMap.get(deal.category) || 0;
      categoryMap.set(deal.category, count + 1);
    });

    // Convert to array
    const stats: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));

    logInfo('Category stats retrieved', { categoriesCount: stats.length });
    return success(stats);
  } catch (error) {
    logError('Failed to get category stats', error as Error);
    return failure(error as Error);
  }
}

/**
 * Calculates the discount percentage
 * @param deal - The deal to calculate discount for
 * @returns Discount percentage rounded to 2 decimals
 */
export function calculateDiscount(deal: Deal): number {
  if (deal.originalPrice <= 0) {
    return 0;
  }
  const discount = ((deal.originalPrice - deal.discountedPrice) / deal.originalPrice) * 100;
  return Math.round(discount * 100) / 100;
}
