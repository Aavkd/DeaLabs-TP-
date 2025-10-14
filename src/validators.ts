/**
 * @file Input validation functions
 * @description Centralized validation for deal inputs (titles, prices, URLs, categories)
 */

import { CategoryValue } from './types';

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 200;
const MIN_PRICE = 0;
const MAX_PRICE = 1000000;
const URL_REGEX = /^https?:\/\/.+/i;
const VALID_CATEGORIES = ['Tech', 'Gaming', 'Home', 'Grocery'];

/**
 * Validates a deal title
 * @param title - The title to validate
 * @returns True if valid
 * @throws Error with descriptive message if invalid
 */
export function validateTitle(title: string): boolean {
  if (!title || typeof title !== 'string') {
    throw new Error('Title is required and must be a string');
  }

  const trimmed = title.trim();
  if (trimmed.length < MIN_TITLE_LENGTH) {
    throw new Error(`Title must be at least ${MIN_TITLE_LENGTH} characters long`);
  }

  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new Error(`Title must not exceed ${MAX_TITLE_LENGTH} characters`);
  }

  return true;
}

/**
 * Validates a price value
 * @param price - The price to validate
 * @param fieldName - Name of the field for error messages
 * @returns True if valid
 * @throws Error with descriptive message if invalid
 */
export function validatePrice(price: number, fieldName = 'Price'): boolean {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  if (price < MIN_PRICE) {
    throw new Error(`${fieldName} must be greater than or equal to ${MIN_PRICE}`);
  }

  if (price > MAX_PRICE) {
    throw new Error(`${fieldName} must not exceed ${MAX_PRICE}`);
  }

  return true;
}

/**
 * Validates that discounted price is less than original price
 * @param originalPrice - The original price
 * @param discountedPrice - The discounted price
 * @returns True if valid
 * @throws Error with descriptive message if invalid
 */
export function validatePriceRelationship(originalPrice: number, discountedPrice: number): boolean {
  validatePrice(originalPrice, 'Original price');
  validatePrice(discountedPrice, 'Discounted price');

  if (discountedPrice >= originalPrice) {
    throw new Error('Discounted price must be less than original price');
  }

  return true;
}

/**
 * Validates a URL
 * @param url - The URL to validate
 * @returns True if valid
 * @throws Error with descriptive message if invalid
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required and must be a string');
  }

  const trimmed = url.trim();
  if (!URL_REGEX.test(trimmed)) {
    throw new Error('URL must be a valid HTTP or HTTPS URL');
  }

  return true;
}

/**
 * Validates a category
 * @param category - The category to validate
 * @returns True if valid
 * @throws Error with descriptive message if invalid
 */
export function validateCategory(category: string): category is CategoryValue {
  if (!category || typeof category !== 'string') {
    throw new Error('Category is required and must be a string');
  }

  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  return true;
}

/**
 * Returns all valid categories
 * @returns Array of valid category values
 */
export function getValidCategories(): string[] {
  return VALID_CATEGORIES;
}

/**
 * Validates a keyword for search
 * @param keyword - The keyword to validate
 * @returns True if valid
 * @throws Error with descriptive message if invalid
 */
export function validateKeyword(keyword: string): boolean {
  if (!keyword || typeof keyword !== 'string') {
    throw new Error('Keyword is required and must be a string');
  }

  const trimmed = keyword.trim();
  if (trimmed.length < 2) {
    throw new Error('Keyword must be at least 2 characters long');
  }

  return true;
}

/**
 * Sanitizes a string by trimming whitespace
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input.trim();
}
