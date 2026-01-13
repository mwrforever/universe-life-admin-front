/**
 * formatBytes 工具函数测试
 * Property 17: Format Functions Correctness
 * Validates: Requirements 9.1, 9.3, 9.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatBytes, formatSpeed, formatDuration } from '../formatBytes';

describe('formatBytes', () => {
  // Property 17: Format Functions Correctness
  it('should return string in format "{value} {unit}" for any non-negative byte value', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
        (bytes) => {
          const result = formatBytes(bytes);
          // Should match pattern: number followed by space and unit
          const pattern = /^[\d.]+ (B|KB|MB|GB|TB|PB)$/;
          expect(result).toMatch(pattern);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle zero correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should handle negative values by prefixing with minus', () => {
    expect(formatBytes(-1024)).toBe('-1.00 KB');
  });

  it('should handle infinite values', () => {
    expect(formatBytes(Infinity)).toBe('Invalid');
    expect(formatBytes(-Infinity)).toBe('Invalid');
  });

  it('should handle NaN', () => {
    expect(formatBytes(NaN)).toBe('Invalid');
  });

  it('should format bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1)).toBe('1.00 B');
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
  });

  it('should respect decimals parameter', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB');
    expect(formatBytes(1536, 1)).toBe('1.5 KB');
    expect(formatBytes(1536, 3)).toBe('1.500 KB');
  });
});

describe('formatSpeed', () => {
  // Property 17: Format Functions Correctness
  it('should return string in format "{value} {unit}/s" for any non-negative speed value', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
        (speed) => {
          const result = formatSpeed(speed);
          // Should match pattern: number followed by space, unit, and /s
          const pattern = /^[\d.]+ (B|KB|MB|GB|TB|PB)\/s$/;
          expect(result).toMatch(pattern);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format speed correctly', () => {
    expect(formatSpeed(0)).toBe('0 B/s');
    expect(formatSpeed(1024)).toBe('1.00 KB/s');
    expect(formatSpeed(1024 * 1024)).toBe('1.00 MB/s');
  });
});

describe('formatDuration', () => {
  // Property 17: Format Functions Correctness
  it('should return human-readable duration string for any non-negative duration', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 86400 * 365 }), // Up to 1 year in seconds
        (seconds) => {
          const result = formatDuration(seconds);
          // Should be a non-empty string containing Chinese time units
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
          // Should contain at least one time unit
          expect(result).toMatch(/(小时|分钟|秒)/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle zero correctly', () => {
    expect(formatDuration(0)).toBe('0秒');
  });

  it('should handle negative values by prefixing with minus', () => {
    expect(formatDuration(-60)).toBe('-1分钟');
  });

  it('should handle infinite values', () => {
    expect(formatDuration(Infinity)).toBe('Invalid');
  });

  it('should format duration correctly', () => {
    expect(formatDuration(0)).toBe('0秒');
    expect(formatDuration(30)).toBe('30秒');
    expect(formatDuration(60)).toBe('1分钟');
    expect(formatDuration(90)).toBe('1分钟30秒');
    expect(formatDuration(3600)).toBe('1小时');
    expect(formatDuration(3661)).toBe('1小时1分钟1秒');
  });
});
