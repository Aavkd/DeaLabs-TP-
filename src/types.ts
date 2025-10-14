/**
 * @file Type definitions for the Mini Dealabs CLI application
 * @description Central type definitions for deals, votes, categories, and result types
 */

/**
 * Supported deal categories
 */
// eslint-disable-next-line no-shadow
export const enum Category {
  TECH = 'Tech',
  GAMING = 'Gaming',
  HOME = 'Home',
  GROCERY = 'Grocery',
}

/**
 * Valid category values as a type
 */
export type CategoryValue = 'Tech' | 'Gaming' | 'Home' | 'Grocery';

/**
 * Vote action types
 */
// eslint-disable-next-line no-shadow
export const enum VoteAction {
  HOT = 'hot',
  COLD = 'cold',
}

/**
 * Represents a deal in the system
 */
export interface Deal {
  /** Unique identifier for the deal */
  id: string;
  /** Title of the deal */
  title: string;
  /** Original price before discount */
  originalPrice: number;
  /** Discounted price */
  discountedPrice: number;
  /** URL to the deal */
  url: string;
  /** Category of the deal */
  category: CategoryValue;
  /** Temperature score (votes hot - votes cold) */
  temperature: number;
  /** Number of hot votes */
  votesHot: number;
  /** Number of cold votes */
  votesCold: number;
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Input data for creating a new deal
 */
export interface CreateDealInput {
  /** Title of the deal */
  title: string;
  /** Original price before discount */
  originalPrice: number;
  /** Discounted price */
  discountedPrice: number;
  /** URL to the deal */
  url: string;
  /** Category of the deal */
  category: CategoryValue;
}

/**
 * Statistics about deals by category
 */
export interface CategoryStats {
  /** Category name */
  category: CategoryValue;
  /** Number of deals in this category */
  count: number;
}

/**
 * Success result type
 */
export interface ResultSuccess<T> {
  /** Indicates successful operation */
  ok: true;
  /** The successful value */
  value: T;
}

/**
 * Error result type
 */
export interface ResultError {
  /** Indicates failed operation */
  ok: false;
  /** The error that occurred */
  error: Error;
}

/**
 * Result type for operations that may fail
 * @template T The type of the successful value
 */
export type Result<T> = ResultSuccess<T> | ResultError;

/**
 * Creates a successful result
 * @template T The type of the value
 * @param value - The success value
 * @returns A success result
 */
export function success<T>(value: T): ResultSuccess<T> {
  return { ok: true, value };
}

/**
 * Creates an error result
 * @param error - The error
 * @returns An error result
 */
export function failure(error: Error): ResultError {
  return { ok: false, error };
}

/**
 * Type guard to check if result is successful
 * @param result - The result to check
 * @returns True if result is successful
 */
export function isSuccess<T>(result: Result<T>): result is ResultSuccess<T> {
  return result.ok === true;
}

/**
 * Type guard to check if result is an error
 * @param result - The result to check
 * @returns True if result is an error
 */
export function isError<T>(result: Result<T>): result is ResultError {
  return result.ok === false;
}
