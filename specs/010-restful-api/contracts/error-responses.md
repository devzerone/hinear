# Error Response Contract

**Version**: 1.0
**Date**: 2026-03-27

## Overview

This document defines the standard error response format for all Hinear API endpoints. Consistent error handling improves developer experience and enables programmatic error handling.

---

## Error Response Structure

All error responses follow this structure:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: unknown;      // Additional error context
    requestId?: string;     // Request identifier for support
    timestamp: string;      // ISO 8601 timestamp
  };
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | boolean | Yes | Always `false` for errors |
| `error.code` | string | Yes | Machine-readable error code (see [Error Codes](#error-codes)) |
| `error.message` | string | Yes | Human-readable error message |
| `error.details` | unknown | No | Additional context (validation errors, resource IDs, etc.) |
| `error.requestId` | string | No | Unique request identifier for troubleshooting |
| `error.timestamp` | string | Yes | ISO 8601 timestamp of when the error occurred |

---

## HTTP Status Codes

The API uses standard HTTP status codes to indicate error types:

| Status Code | Name | Usage |
|-------------|------|-------|
| 400 | Bad Request | Invalid request data, validation errors |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (optimistic locking) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Error Codes

### Validation Errors

#### `VALIDATION_ERROR`

**Status**: `400 Bad Request`

**Description**: The request data is invalid or missing required fields.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "title": ["Title is required"],
        "priority": ["Priority must be one of: Low, Medium, High, Critical"]
      }
    },
    "requestId": "req_abc123",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

**Details Structure**:
```typescript
interface ValidationErrorDetails {
  fields: Record<string, string[]>;  // Field name -> array of error messages
}
```

---

#### `INVALID_JSON`

**Status**: `400 Bad Request`

**Description**: The request body is not valid JSON.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_JSON",
    "message": "Request body is not valid JSON",
    "details": {
      "parseError": "Unexpected token } at position 42"
    },
    "requestId": "req_def456",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

### Authentication Errors

#### `UNAUTHORIZED`

**Status**: `401 Unauthorized`

**Description**: Authentication is required or the provided credentials are invalid.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": {
      "authMethod": "session"
    },
    "requestId": "req_ghi789",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

#### `INVALID_TOKEN`

**Status**: `401 Unauthorized`

**Description**: The provided authentication token is invalid or expired.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired authentication token",
    "requestId": "req_jkl012",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

### Authorization Errors

#### `FORBIDDEN`

**Status**: `403 Forbidden`

**Description**: The authenticated user does not have permission to perform this action.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action",
    "details": {
      "requiredRole": "owner",
      "userRole": "member",
      "action": "delete_project"
    },
    "requestId": "req_mno345",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

#### `NOT_A_MEMBER`

**Status**: `403 Forbidden`

**Description**: The user is not a member of the requested project.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "NOT_A_MEMBER",
    "message": "You are not a member of this project",
    "details": {
      "projectId": "550e8400-e29b-41d4-a716-446655440000"
    },
    "requestId": "req_pqr678",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

### Not Found Errors

#### `NOT_FOUND`

**Status**: `404 Not Found`

**Description**: The requested resource does not exist.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found",
    "details": {
      "resource": "Project",
      "id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "requestId": "req_stu901",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

#### `USER_NOT_FOUND`

**Status**: `404 Not Found`

**Description**: The specified user does not exist.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": {
      "userId": "user-123"
    },
    "requestId": "req_vwx234",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

### Conflict Errors

#### `CONFLICT`

**Status**: `409 Conflict`

**Description**: Optimistic locking conflict - the resource has been modified by another user.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "This issue has been modified by another user. Please refresh and try again.",
    "details": {
      "resource": "Issue",
      "id": "issue-123",
      "yourVersion": 1,
      "currentVersion": 2
    },
    "requestId": "req_yza567",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

#### `DUPLICATE_RESOURCE`

**Status**: `409 Conflict`

**Description**: A resource with the same unique identifier already exists.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_RESOURCE",
    "message": "A project with this key already exists",
    "details": {
      "field": "key",
      "value": "WEB",
      "existingProjectId": "550e8400-e29b-41d4-a716-446655440000"
    },
    "requestId": "req_bcd890",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

### Rate Limiting

#### `RATE_LIMIT_EXCEEDED`

**Status**: `429 Too Many Requests`

**Description**: The client has exceeded the rate limit.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 100,
      "window": "1m",
      "retryAfter": 45
    },
    "requestId": "req_efg123",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

**Headers**:
- `Retry-After`: `45` (seconds until retry is allowed)

---

### Server Errors

#### `INTERNAL_ERROR`

**Status**: `500 Internal Server Error`

**Description**: An unexpected server error occurred.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "requestId": "req_hij456",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

**Note**: The `details` field is intentionally omitted for server errors to avoid leaking sensitive information.

---

#### `DATABASE_ERROR`

**Status**: `500 Internal Server Error`

**Description**: A database error occurred.

**Example**:

```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "A database error occurred. Please try again later.",
    "requestId": "req_klm789",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

## Error Handling Best Practices

### For API Consumers

1. **Always check the `success` field**:
   ```javascript
   const response = await fetch('/api/v1/projects');
   const data = await response.json();

   if (!data.success) {
     // Handle error
     console.error(data.error.code, data.error.message);
     return;
   }

   // Process success response
   ```

2. **Use error codes for programmatic handling**:
   ```javascript
   switch (data.error.code) {
     case 'VALIDATION_ERROR':
       // Show validation errors to user
       displayValidationErrors(data.error.details.fields);
       break;
     case 'UNAUTHORIZED':
       // Redirect to login
       redirectToLogin();
       break;
     case 'CONFLICT':
       // Show conflict message and refresh
       showConflictDialog(data.error.details);
       break;
     default:
       // Show generic error message
       showErrorMessage(data.error.message);
   }
   ```

3. **Log request IDs for troubleshooting**:
   ```javascript
   if (!data.success && data.error.requestId) {
     console.error('API Error:', data.error.requestId);
     // Send to error tracking service
     trackError('api_error', { requestId: data.error.requestId });
   }
   ```

### For API Implementers

1. **Always include error codes** - Never send errors without a code
2. **Sanitize error messages** - Don't leak sensitive information in 500 errors
3. **Include request IDs** - Generate a unique ID for each request for troubleshooting
4. **Use appropriate HTTP status codes** - Match status codes to error types
5. **Provide helpful details** - Include context for validation and not found errors
6. **Log errors server-side** - Log the full error with request ID for debugging

---

## Complete Error Code Reference

| Code | Status | Category | Description |
|------|--------|----------|-------------|
| `VALIDATION_ERROR` | 400 | Validation | Request data validation failed |
| `INVALID_JSON` | 400 | Validation | Invalid JSON in request body |
| `UNAUTHORIZED` | 401 | Authentication | Authentication required |
| `INVALID_TOKEN` | 401 | Authentication | Invalid or expired token |
| `FORBIDDEN` | 403 | Authorization | Insufficient permissions |
| `NOT_A_MEMBER` | 403 | Authorization | Not a project member |
| `NOT_FOUND` | 404 | Not Found | Resource not found |
| `USER_NOT_FOUND` | 404 | Not Found | User not found |
| `CONFLICT` | 409 | Conflict | Optimistic locking conflict |
| `DUPLICATE_RESOURCE` | 409 | Conflict | Duplicate unique identifier |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate Limit | Too many requests |
| `INTERNAL_ERROR` | 500 | Server | Unexpected server error |
| `DATABASE_ERROR` | 500 | Server | Database error |

---

## Example Implementation

### TypeScript Error Types

```typescript
// Success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    version: string;
    [key: string]: unknown;
  };
}

// Error response
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    requestId?: string;
    timestamp: string;
  };
}

// Union type
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Error code enum
enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_JSON = 'INVALID_JSON',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  FORBIDDEN = 'FORBIDDEN',
  NOT_A_MEMBER = 'NOT_A_MEMBER',
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

// Type guard for error responses
function isErrorResponse(response: ApiResponse<unknown>): response is ErrorResponse {
  return !response.success;
}

// Usage
async function fetchProjects(): Promise<void> {
  const response = await fetch('/api/v1/projects');
  const data: ApiResponse<Project[]> = await response.json();

  if (isErrorResponse(data)) {
    // TypeScript knows this is ErrorResponse
    console.error(data.error.code, data.error.message);
    return;
  }

  // TypeScript knows this is SuccessResponse<Project[]>
  console.log(data.data);
}
```

---

**Document Status**: ✅ Final
**All error codes defined with examples and handling guidelines**
