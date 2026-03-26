/**
 * Token Utility Tests
 *
 * TDD Approach: Red-Green-Refactor
 */

import { describe, expect, it } from "vitest";
import {
  formatExpiration,
  generateToken,
  hashToken,
  isTokenExpired,
  parseExpiration,
} from "../token-utils.js";

describe("Token Utilities", () => {
  describe("generateToken", () => {
    it("should generate a token with hinear_mcp_ prefix", () => {
      const token = generateToken();
      expect(token).toMatch(/^hinear_mcp_/);
    });

    it("should generate unique tokens", () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });

    it("should generate tokens of reasonable length", () => {
      const token = generateToken();
      expect(token.length).toBeGreaterThan(50);
      expect(token.length).toBeLessThan(150);
    });
  });

  describe("hashToken", () => {
    it("should hash a token consistently", () => {
      const token = "test-token";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different tokens", () => {
      const hash1 = hashToken("token1");
      const hash2 = hashToken("token2");
      expect(hash1).not.toBe(hash2);
    });

    it("should produce hex-encoded hash", () => {
      const hash = hashToken("test");
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("parseExpiration", () => {
    it('should parse "30d" as 30 days from now', () => {
      const expiration = parseExpiration("30d");
      const now = Date.now();
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

      expect(expiration).toBeInstanceOf(Date);
      if (expiration) {
        expect(expiration.getTime()).toBeGreaterThan(
          now + thirtyDaysInMs - 1000
        );
        expect(expiration.getTime()).toBeLessThanOrEqual(now + thirtyDaysInMs);
      }
    });

    it('should parse "90d" as 90 days from now', () => {
      const expiration = parseExpiration("90d");
      expect(expiration).toBeInstanceOf(Date);
    });

    it('should parse "24h" as 24 hours from now', () => {
      const expiration = parseExpiration("24h");
      const now = Date.now();
      const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

      expect(expiration).toBeInstanceOf(Date);
      if (expiration) {
        expect(expiration.getTime()).toBeGreaterThan(
          now + twentyFourHoursInMs - 1000
        );
        expect(expiration.getTime()).toBeLessThanOrEqual(
          now + twentyFourHoursInMs
        );
      }
    });

    it('should return null for "never"', () => {
      const expiration = parseExpiration("never");
      expect(expiration).toBeNull();
    });

    it("should throw error for invalid format", () => {
      expect(() => parseExpiration("invalid")).toThrow();
      expect(() => parseExpiration("30")).toThrow();
      expect(() => parseExpiration("30x")).toThrow();
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for future expiration", () => {
      const future = new Date(Date.now() + 10000);
      expect(isTokenExpired(future)).toBe(false);
    });

    it("should return true for past expiration", () => {
      const past = new Date(Date.now() - 10000);
      expect(isTokenExpired(past)).toBe(true);
    });

    it("should return false for null expiration (never)", () => {
      expect(isTokenExpired(null)).toBe(false);
    });

    it("should handle string dates", () => {
      const future = new Date(Date.now() + 10000).toISOString();
      expect(isTokenExpired(future)).toBe(false);
    });
  });

  describe("formatExpiration", () => {
    it("should format Date as YYYY-MM-DD", () => {
      const date = new Date("2026-06-24T10:30:00Z");
      const formatted = formatExpiration(date);
      expect(formatted).toBe("2026-06-24");
    });

    it("should format string date", () => {
      const formatted = formatExpiration("2026-06-24T10:30:00Z");
      expect(formatted).toBe("2026-06-24");
    });

    it('should return "Never" for null', () => {
      const formatted = formatExpiration(null);
      expect(formatted).toBe("Never");
    });
  });
});
