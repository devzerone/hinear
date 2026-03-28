import { invalidJson, validationError } from "@/app/api/_lib/errors";

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch (error) {
    throw invalidJson(
      error instanceof Error ? { parseError: error.message } : undefined
    );
  }
}

export function requireNonEmptyString(
  value: unknown,
  field: string,
  message = `${field} is required`
) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw validationError(message, { field });
  }

  return value.trim();
}

export function optionalTrimmedString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parsePositiveInt(
  value: string | null,
  field: string,
  defaultsTo: number,
  max?: number
) {
  if (value === null || value.trim() === "") {
    return defaultsTo;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw validationError(`${field} must be >= 1`, { field, value });
  }

  if (max !== undefined && parsed > max) {
    throw validationError(`${field} cannot exceed ${max}`, {
      field,
      max,
      value: parsed,
    });
  }

  return parsed;
}

export function parseEnumValue<T extends readonly string[]>(
  value: string | null,
  allowed: T,
  field: string
): T[number] | undefined {
  if (!value) {
    return undefined;
  }

  if ((allowed as readonly string[]).includes(value)) {
    return value as T[number];
  }

  throw validationError(`${field} must be one of: ${allowed.join(", ")}`, {
    field,
    value,
  });
}
