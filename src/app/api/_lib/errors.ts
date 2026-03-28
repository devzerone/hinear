import {
  RepositoryError,
  type RepositoryErrorCode,
} from "@/features/issues/lib/repository-errors";
import { AuthenticationRequiredError } from "@/lib/supabase/server-auth";

export class ApiRouteError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiRouteError";
  }
}

export function isApiRouteError(error: unknown): error is ApiRouteError {
  return error instanceof ApiRouteError;
}

export function badRequest(message: string, details?: unknown) {
  return new ApiRouteError("BAD_REQUEST", 400, message, details);
}

export function validationError(message: string, details?: unknown) {
  return new ApiRouteError("VALIDATION_ERROR", 400, message, details);
}

export function invalidJson(details?: unknown) {
  return new ApiRouteError(
    "INVALID_JSON",
    400,
    "Request body is not valid JSON",
    details
  );
}

export function unauthorized(message = "Authentication required") {
  return new ApiRouteError("UNAUTHORIZED", 401, message);
}

export function forbidden(
  message = "You do not have permission to perform this action",
  details?: unknown
) {
  return new ApiRouteError("FORBIDDEN", 403, message, details);
}

export function notFound(message: string, details?: unknown) {
  return new ApiRouteError("NOT_FOUND", 404, message, details);
}

export function conflict(message: string, details?: unknown) {
  return new ApiRouteError("CONFLICT", 409, message, details);
}

function mapRepositoryCode(code: RepositoryErrorCode): string {
  switch (code) {
    case "AUTH_REQUIRED":
      return "UNAUTHORIZED";
    case "ACCESS_DENIED":
    case "FORBIDDEN":
      return "FORBIDDEN";
    case "PROJECT_NOT_FOUND":
    case "ISSUE_NOT_FOUND":
    case "COMMENT_NOT_FOUND":
    case "NOT_MEMBER":
    case "PARENT_COMMENT_NOT_FOUND":
      return "NOT_FOUND";
    case "VALIDATION_ERROR":
      return "VALIDATION_ERROR";
    case "CONFLICT":
    case "ALREADY_MEMBER":
    case "LAST_OWNER":
    case "OWNER_EXISTS":
    case "PROJECT_KEY_TAKEN":
    case "PROJECT_INVITATION_EXISTS":
      return "CONFLICT";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

export function toApiRouteError(error: unknown): ApiRouteError {
  if (error instanceof ApiRouteError) {
    return error;
  }

  if (error instanceof AuthenticationRequiredError) {
    return unauthorized();
  }

  if (error instanceof RepositoryError) {
    return new ApiRouteError(
      mapRepositoryCode(error.code),
      error.status,
      error.message
    );
  }

  if (
    error &&
    typeof error === "object" &&
    "type" in error &&
    (error as { type?: string }).type === "CONFLICT"
  ) {
    const conflictError = error as {
      currentIssue?: unknown;
      currentVersion?: unknown;
      message?: string;
      requestedVersion?: unknown;
    };

    return conflict(conflictError.message ?? "Conflict detected", {
      currentIssue: conflictError.currentIssue,
      currentVersion: conflictError.currentVersion,
      requestedVersion: conflictError.requestedVersion,
    });
  }

  return new ApiRouteError(
    "INTERNAL_SERVER_ERROR",
    500,
    error instanceof Error ? error.message : "Internal server error"
  );
}
