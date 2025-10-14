/**
 * @file Storage layer for deal persistence
 * @description Handles JSON file read/write operations with error handling
 */

import fs from 'fs/promises';
import path from 'path';
import { Deal } from './types';
import { logError, logInfo, logWarn } from './logger';

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'deals.json');

/**
 * Ensures the data directory exists
 * @returns Promise that resolves when directory is ready
 */
async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    logInfo('Creating data directory', { path: DATA_DIR });
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Loads deals from the JSON file
 * @returns Promise resolving to array of deals (empty if file doesn't exist or is corrupt)
 */
export async function loadDeals(): Promise<Deal[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      logWarn('Deals file does not contain an array, returning empty array');
      return [];
    }

    logInfo('Deals loaded successfully', { count: parsed.length });
    return parsed as Deal[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      logInfo('Deals file does not exist, returning empty array');
      return [];
    }

    if (error instanceof SyntaxError) {
      logError('Failed to parse deals JSON file, returning empty array', error);
      return [];
    }

    logError('Unexpected error loading deals', error as Error);
    return [];
  }
}

/**
 * Saves deals to the JSON file
 * @param deals - Array of deals to save
 * @returns Promise that resolves when save is complete
 * @throws Error if save fails
 */
export async function saveDeals(deals: Deal[]): Promise<void> {
  try {
    await ensureDataDirectory();
    const data = JSON.stringify(deals, null, 2);
    await fs.writeFile(DATA_FILE, data, 'utf-8');
    logInfo('Deals saved successfully', { count: deals.length });
  } catch (error) {
    logError('Failed to save deals', error as Error);
    throw new Error(`Failed to save deals: ${(error as Error).message}`);
  }
}

/**
 * Seeds the data file with sample deals if empty
 * @returns Promise that resolves when seeding is complete
 */
export async function seedDataIfEmpty(): Promise<void> {
  const deals = await loadDeals();

  if (deals.length === 0) {
    logInfo('Seeding initial deals data');
    const sampleDeals: Deal[] = [
      {
        id: 'a1b2c3d',
        title: 'Gaming Laptop RTX 4060',
        originalPrice: 1200,
        discountedPrice: 999,
        url: 'https://example.com/gaming-laptop',
        category: 'Tech',
        temperature: 5,
        votesHot: 7,
        votesCold: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'x9y8z7w',
        title: 'PlayStation 5 Console Bundle',
        originalPrice: 550,
        discountedPrice: 499,
        url: 'https://example.com/ps5',
        category: 'Gaming',
        temperature: 15,
        votesHot: 18,
        votesCold: 3,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p4q5r6s',
        title: 'Smart Home Hub',
        originalPrice: 150,
        discountedPrice: 89,
        url: 'https://example.com/smart-hub',
        category: 'Home',
        temperature: -2,
        votesHot: 3,
        votesCold: 5,
        createdAt: new Date().toISOString(),
      },
    ];

    await saveDeals(sampleDeals);
    logInfo('Sample deals seeded successfully');
  }
}

/**
 * Gets the path to the data file
 * @returns Absolute path to deals.json
 */
export function getDataFilePath(): string {
  return DATA_FILE;
}
