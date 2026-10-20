// ============================================================================
// frontend/src/utils/number-format.util.spec.ts
// Unit Tests for Number & Decimal Formatting Utility
// ============================================================================

import {
  formatDecimal,
  formatAccuracyPercent,
  formatPercent,
} from './number-format.util';

describe('number-format.util', () => {
  describe('formatDecimal', () => {
    it('should limit numbers with more than 3 decimal places to 3 places with rounding', () => {
      expect(formatDecimal(66.66667)).toBe('66.667');
      expect(formatDecimal(12.3456)).toBe('12.346');
      expect(formatDecimal(12.3454)).toBe('12.345');
      expect(formatDecimal(0.1239)).toBe('0.124');
    });

    it('should preserve integers and decimals with 1 to 3 digits without padding zeroes', () => {
      expect(formatDecimal(100)).toBe('100');
      expect(formatDecimal(0)).toBe('0');
      expect(formatDecimal(5.5)).toBe('5.5');
      expect(formatDecimal(5.25)).toBe('5.25');
      expect(formatDecimal(5.123)).toBe('5.123');
    });

    it('should handle strings and edge cases safely', () => {
      expect(formatDecimal('75.4567')).toBe('75.457');
      expect(formatDecimal(null)).toBe('0');
      expect(formatDecimal(undefined)).toBe('0');
      expect(formatDecimal('')).toBe('0');
      expect(formatDecimal(NaN)).toBe('0');
      expect(formatDecimal(Infinity)).toBe('0');
    });

    it('should respect custom maxDecimals', () => {
      expect(formatDecimal(12.3456, 2)).toBe('12.35');
      expect(formatDecimal(12.3456, 1)).toBe('12.3');
      expect(formatDecimal(12.3456, 0)).toBe('12');
    });
  });

  describe('formatAccuracyPercent', () => {
    it('should convert ratio (0.0 - 1.0) to percentage and cap at 3 decimals', () => {
      expect(formatAccuracyPercent(0.75)).toBe('75');
      expect(formatAccuracyPercent(2 / 3)).toBe('66.667');
      expect(formatAccuracyPercent(1 / 3)).toBe('33.333');
      expect(formatAccuracyPercent(1)).toBe('100');
      expect(formatAccuracyPercent(0)).toBe('0');
    });

    it('should handle values already in percentage scale (0 - 100)', () => {
      expect(formatAccuracyPercent(85.55555)).toBe('85.556');
      expect(formatAccuracyPercent(90)).toBe('90');
    });
  });

  describe('formatPercent', () => {
    it('should format decimal and append % symbol', () => {
      expect(formatPercent(66.66667)).toBe('66.667%');
      expect(formatPercent(100)).toBe('100%');
      expect(formatPercent(0)).toBe('0%');
    });
  });
});
