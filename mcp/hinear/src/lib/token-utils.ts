import { createHash } from "node:crypto";

/**
 * Generate a cryptographically random MCP access token
 * @returns A 64-byte random token with 'hinear_mcp_' prefix
 */
export function generateToken(): string {
  const bytes = Buffer.from(Date.now().toString() + Math.random().toString());
  const hash = createHash("sha256").update(bytes).digest("base64url");
  return `hinear_mcp_${hash}`;
}

/**
 * Hash a token using SHA-256
 * @param token - The token to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Parse expiration string to Date
 * @param expiresIn - Expiration duration (e.g., "30d", "90d", "24h", "never")
 * @returns Expiration Date or null for "never"
 * @throws Error if format is invalid
 */
export function parseExpiration(expiresIn: string): Date | null {
  if (expiresIn === "never") {
    return null;
  }

  const match = expiresIn.match(/^(\d+)([dh])$/);
  if (!match) {
    throw new Error(
      'Invalid expires_in format. Expected format: {number}{unit} where unit is "d" (days) or "h" (hours)'
    );
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const now = Date.now();

  switch (unit) {
    case "d":
      return new Date(now + value * 24 * 60 * 60 * 1000);
    case "h":
      return new Date(now + value * 60 * 60 * 1000);
    default:
      throw new Error(
        `Invalid expires_in unit: ${unit}. Expected "d" (days) or "h" (hours)`
      );
  }
}

/**
 * Check if a token is expired
 * @param expiresAt - Expiration date or null for never
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(expiresAt: Date | string | null): boolean {
  if (!expiresAt) {
    return false;
  }

  const expiryDate =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return expiryDate < new Date();
}

/**
 * Format expiration date for display
 * @param expiresAt - Expiration date or null for never
 * @returns Formatted string (e.g., "2026-06-24" or "Never")
 */
export function formatExpiration(expiresAt: Date | string | null): string {
  if (!expiresAt) {
    return "Never";
  }

  const date = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return date.toISOString().split("T")[0];
}
