/**
 * @file Unit tests for validators
 */

import {
  validateTitle,
  validatePrice,
  validatePriceRelationship,
  validateUrl,
  validateCategory,
  validateKeyword,
  sanitizeString,
  getValidCategories,
} from '../src/validators';

describe('validators', () => {
  describe('validateTitle', () => {
    it('should accept valid title', () => {
      expect(validateTitle('Gaming Laptop')).toBe(true);
      expect(validateTitle('PlayStation 5')).toBe(true);
    });

    it('should reject empty or non-string title', () => {
      expect(() => validateTitle('')).toThrow('Title is required');
      expect(() => validateTitle('  ')).toThrow('at least 3 characters');
    });

    it('should reject title too short', () => {
      expect(() => validateTitle('ab')).toThrow('at least 3 characters');
    });

    it('should reject title too long', () => {
      const longTitle = 'a'.repeat(201);
      expect(() => validateTitle(longTitle)).toThrow('must not exceed 200 characters');
    });
  });

  describe('validatePrice', () => {
    it('should accept valid price', () => {
      expect(validatePrice(100)).toBe(true);
      expect(validatePrice(0)).toBe(true);
      expect(validatePrice(999.99)).toBe(true);
    });

    it('should reject non-number price', () => {
      expect(() => validatePrice(NaN)).toThrow('must be a valid number');
    });

    it('should reject negative price', () => {
      expect(() => validatePrice(-10)).toThrow('must be greater than or equal to 0');
    });

    it('should reject price exceeding maximum', () => {
      expect(() => validatePrice(1000001)).toThrow('must not exceed 1000000');
    });

    it('should use custom field name in error', () => {
      expect(() => validatePrice(-1, 'Custom Price')).toThrow('Custom Price');
    });
  });

  describe('validatePriceRelationship', () => {
    it('should accept discounted price less than original', () => {
      expect(validatePriceRelationship(100, 80)).toBe(true);
    });

    it('should reject discounted price equal to original', () => {
      expect(() => validatePriceRelationship(100, 100)).toThrow(
        'Discounted price must be less than original price'
      );
    });

    it('should reject discounted price greater than original', () => {
      expect(() => validatePriceRelationship(100, 120)).toThrow(
        'Discounted price must be less than original price'
      );
    });

    it('should validate individual prices', () => {
      expect(() => validatePriceRelationship(-10, 50)).toThrow('Original price');
      expect(() => validatePriceRelationship(100, -50)).toThrow('Discounted price');
    });
  });

  describe('validateUrl', () => {
    it('should accept valid HTTP/HTTPS URLs', () => {
      expect(validateUrl('http://example.com')).toBe(true);
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('https://example.com/path?query=value')).toBe(true);
    });

    it('should reject empty or non-string URL', () => {
      expect(() => validateUrl('')).toThrow('URL is required');
    });

    it('should reject invalid URL format', () => {
      expect(() => validateUrl('not-a-url')).toThrow('valid HTTP or HTTPS URL');
      expect(() => validateUrl('ftp://example.com')).toThrow('valid HTTP or HTTPS URL');
    });
  });

  describe('validateCategory', () => {
    it('should accept valid categories', () => {
      expect(validateCategory('Tech')).toBe(true);
      expect(validateCategory('Gaming')).toBe(true);
      expect(validateCategory('Home')).toBe(true);
      expect(validateCategory('Grocery')).toBe(true);
    });

    it('should reject empty or non-string category', () => {
      expect(() => validateCategory('')).toThrow('Category is required');
    });

    it('should reject invalid category', () => {
      expect(() => validateCategory('InvalidCategory')).toThrow('Category must be one of:');
    });
  });

  describe('validateKeyword', () => {
    it('should accept valid keyword', () => {
      expect(validateKeyword('laptop')).toBe(true);
      expect(validateKeyword('gaming console')).toBe(true);
    });

    it('should reject empty keyword', () => {
      expect(() => validateKeyword('')).toThrow('Keyword is required');
    });

    it('should reject keyword too short', () => {
      expect(() => validateKeyword('a')).toThrow('at least 2 characters');
    });
  });

  describe('getValidCategories', () => {
    it('should return array of valid categories', () => {
      const categories = getValidCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories).toContain('Tech');
      expect(categories).toContain('Gaming');
      expect(categories).toContain('Home');
      expect(categories).toContain('Grocery');
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('world')).toBe('world');
    });
  });
});
