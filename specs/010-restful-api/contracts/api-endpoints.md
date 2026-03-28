# API Endpoints Contract

**Version**: 1.0
**Base URL**: `/api/v1`
**Date**: 2026-03-27

## Overview

This document defines all RESTful API endpoints for the Hinear issue management API. All endpoints follow RESTful conventions with appropriate HTTP methods, status codes, and request/response formats.

---

## Conventions

### URL Structure

- **Base Path**: `/api/v1`
- **Resource Naming**: Plural nouns for collections (`/projects`, `/issues`)
- **Nested Resources**: Reflect domain relationships (`/projects/{projectId}/issues`)
- **IDs**: UUID format for all resource identifiers

### HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource or collection | ✅ | ✅ |
| POST | Create new resource | ❌ | ❌ |
| PUT | Replace entire resource | ✅ | ❌ |
| PATCH | Partial update of resource | ❌ | ❌ |
| DELETE | Remove resource | ✅ | ❌ |

### Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (authorization failed) |
| 404 | Not Found |
| 409 | Conflict (optimistic locking) |
| 500 | Internal Server Error |

### Request Format

- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Body**: JSON object for POST/PUT/PATCH requests

### Response Format

All responses follow the structure defined in [error-responses.md](error-responses.md).

---

## Endpoints

### Projects

#### List Projects

```http
GET /api/v1/projects
```

**Description**: Retrieves a paginated list of projects accessible to the authenticated user.

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (1-indexed) |
| `limit` | integer | No | 20 | Items per page (max 100) |
| `sort` | string | No | `created_at` | Sort field (`created_at`, `name`, `key`) |
| `order` | string | No | `desc` | Sort order (`asc`, `desc`) |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Website Redesign",
        "key": "WEB",
        "type": "team",
        "description": "Redesign company website",
        "owner_id": "user-123",
        "created_at": "2026-03-27T10:00:00Z",
        "updated_at": "2026-03-27T10:00:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "version": "1.0"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Authentication required

---

#### Get Project

```http
GET /api/v1/projects/{projectId}
```

**Description**: Retrieves a single project by ID.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | Project ID |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Website Redesign",
    "key": "WEB",
    "type": "team",
    "description": "Redesign company website",
    "owner_id": "user-123",
    "created_at": "2026-03-27T10:00:00Z",
    "updated_at": "2026-03-27T10:00:00Z"
  },
  "meta": {
    "version": "1.0"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not a member of the project
- `404 Not Found`: Project does not exist

---

#### Create Project

```http
POST /api/v1/projects
```

**Description**: Creates a new project.

**Request Body**:

```json
{
  "name": "Website Redesign",
  "key": "WEB",
  "type": "team",
  "description": "Redesign company website"
}
```

**Fields**:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Min 1, Max 100 chars |
| `key` | string | Yes | 2-10 uppercase letters, unique |
| `type` | string | Yes | `personal` or `team` |
| `description` | string | No | Max 1000 chars |

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Website Redesign",
    "key": "WEB",
    "type": "team",
    "description": "Redesign company website",
    "owner_id": "user-123",
    "created_at": "2026-03-27T10:00:00Z",
    "updated_at": "2026-03-27T10:00:00Z"
  },
  "meta": {
    "version": "1.0"
  }
}
```

**Headers**:
- `Location`: `/api/v1/projects/550e8400-e29b-41d4-a716-446655440000`

**Error Responses**:
- `400 Bad Request`: Validation error (e.g., duplicate key, invalid fields)
- `401 Unauthorized`: Authentication required

---

#### Update Project

```http
PATCH /api/v1/projects/{projectId}
```

**Description**: Partially updates a project. Only provided fields are updated.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | Project ID |

**Request Body**:

```json
{
  "name": "New Project Name",
  "description": "Updated description"
}
```

**Fields** (all optional):

| Field | Type | Validation |
|-------|------|------------|
| `name` | string | Min 1, Max 100 chars |
| `description` | string | Max 1000 chars |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "New Project Name",
    "key": "WEB",
    "type": "team",
    "description": "Updated description",
    "owner_id": "user-123",
    "created_at": "2026-03-27T10:00:00Z",
    "updated_at": "2026-03-27T10:05:00Z"
  },
  "meta": {
    "version": "1.0"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not an owner
- `404 Not Found`: Project does not exist

---

#### Delete Project

```http
DELETE /api/v1/projects/{projectId}
```

**Description**: Deletes a project and all associated issues.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | Project ID |

**Response**: `204 No Content`

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not an owner
- `404 Not Found`: Project does not exist

---

### Issues

#### List Issues

```http
GET /api/v1/projects/{projectId}/issues
```

**Description**: Retrieves a cursor-paginated list of issues in a project.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | Project ID |

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `cursor` | string | No | - | Opaque cursor for pagination |
| `limit` | integer | No | 20 | Items per page (max 100) |
| `status` | string | No | - | Filter by status (`Triage`, `Backlog`, `Todo`, `In Progress`, `Done`) |
| `priority` | string | No | - | Filter by priority (`Low`, `Medium`, `High`, `Critical`) |
| `assignee_id` | string (UUID) | No | - | Filter by assignee |
| `sort` | string | No | `created_at` | Sort field (`created_at`, `updated_at`, `priority`, `status`) |
| `order` | string | No | `desc` | Sort order (`asc`, `desc`) |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "issue-123",
        "project_id": "550e8400-e29b-41d4-a716-446655440000",
        "identifier": "WEB-1",
        "title": "Fix navigation bug",
        "description": "Navigation menu not working on mobile",
        "status": "Todo",
        "priority": "High",
        "assignee": {
          "id": "user-456",
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "creator": {
          "id": "user-123",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "labels": [
          {
            "id": "label-1",
            "name": "bug",
            "color": "#FF5733"
          }
        ],
        "created_at": "2026-03-27T10:00:00Z",
        "updated_at": "2026-03-27T10:00:00Z",
        "version": 1
      }
    ],
    "nextCursor": "eyJjcmVhdGVkX2F0IjoiMjAyNi0wMy0yN1QxMDowMDowMFoiLCJpZCIiaXNzdWUtMTIzIn0=",
    "hasMore": true
  },
  "meta": {
    "version": "1.0"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not a member of the project
- `404 Not Found`: Project does not exist

---

#### Get Issue

```http
GET /api/v1/projects/{projectId}/issues/{issueId}
```

**Description**: Retrieves a single issue by ID.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | Project ID |
| `issueId` | string (UUID) | Yes | Issue ID |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "issue-123",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "identifier": "WEB-1",
    "title": "Fix navigation bug",
    "description": "Navigation menu not working on mobile",
    "status": "Todo",
    "priority": "High",
    "assignee": {
      "id": "user-456",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "creator": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "labels": [
      {
        "id": "label-1",
        "name": "bug",
        "color": "#FF5733"
      }
    ],
    "created_at": "2026-03-27T10:00:00Z",
    "updated_at": "2026-03-27T10:00:00Z",
    "version": 1
  },
  "meta": {
    "version": "1.0"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not a member of the project
- `404 Not Found`: Issue does not exist

---

#### Create Issue

```http
POST /api/v1/projects/{projectId}/issues
```

**Description**: Creates a new issue in the project.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | Project ID |

**Request Body**:

```json
{
  "title": "Fix navigation bug",
  "description": "Navigation menu not working on mobile",
  "status": "Triage",
  "priority": "High",
  "assignee_id": "user-456",
  "label_ids": ["label-1", "label-2"]
}
```

**Fields**:

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `title` | string | Yes | - | Min 1, Max 200 chars |
| `description` | string | No | - | Max 10000 chars |
| `status` | string | No | `Triage` | `Triage`, `Backlog`, `Todo`, `In Progress`, `Done` |
| `priority` | string | No | `Medium` | `Low`, `Medium`, `High`, `Critical` |
| `assignee_id` | string (UUID) | No | - | Must be project member |
| `label_ids` | array of UUID | No | [] | Valid label IDs from project |

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "issue-123",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "identifier": "WEB-1",
    "title": "Fix navigation bug",
    "description": "Navigation menu not working on mobile",
    "status": "Triage",
    "priority": "High",
    "assignee": {
      "id": "user-456",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "creator": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "labels": [
      {
        "id": "label-1",
        "name": "bug",
        "color": "#FF5733"
      }
    ],
    "created_at": "2026-03-27T10:00:00Z",
    "updated_at": "2026-03-27T10:00:00Z",
    "version": 1
  },
  "meta": {
    "version": "1.0"
  }
}
```

**Headers**:
- `Location`: `/api/v1/projects/550e8400-e29b-41d4-a716-446655440000/issues/issue-123`

**Error Responses**:
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not a member of the project
- `404 Not Found`: Project does not exist

---

#### Update Issue

```http
PATCH /api/v1/projects/{projectId}/issues/{issueId}
```

**Description**: Partially updates an issue. Uses optimistic locking via the `version` field.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | Project ID |
| `issueId` | string (UUID) | Yes | Issue ID |

**Request Body**:

```json
{
  "title": "Updated title",
  "status": "In Progress",
  "version": 1
}
```

**Fields** (all optional):

| Field | Type | Validation |
|-------|------|------------|
| `title` | string | Min 1, Max 200 chars |
| `description` | string | Max 10000 chars |
| `status` | string | `Triage`, `Backlog`, `Todo`, `In Progress`, `Done` |
| `priority` | string | `Low`, `Medium`, `High`, `Critical` |
| `assignee_id` | string (UUID) | Must be project member |
| `label_ids` | array of UUID | Valid label IDs from project |
| `version` | integer | Required, must match current version |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "issue-123",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "identifier": "WEB-1",
    "title": "Updated title",
    "description": "Navigation menu not working on mobile",
    "status": "In Progress",
    "priority": "High",
    "assignee": {
      "id": "user-456",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "creator": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "labels": [
      {
        "id": "label-1",
        "name": "bug",
        "color": "#FF5733"
      }
    ],
    "created_at": "2026-03-27T10:00:00Z",
    "updated_at": "2026-03-27T10:05:00Z",
    "version": 2
  },
  "meta": {
    "version": "1.0"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation error or version mismatch
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not a member of the project
- `404 Not Found`: Issue does not exist
- `409 Conflict`: Version mismatch (optimistic locking)

---

#### Delete Issue

```http
DELETE /api/v1/projects/{projectId}/issues/{issueId}
```

**Description**: Deletes an issue.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | Project ID |
| `issueId` | string (UUID) | Yes | Issue ID |

**Response**: `204 No Content`

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not a member of the project
- `404 Not Found`: Issue does not exist

---

### Project Members

#### List Project Members

```http
GET /api/v1/projects/{projectId}/members
```

**Description**: Retrieves all members of a team project.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | Project ID |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "member-1",
      "project_id": "550e8400-e29b-41d4-a716-446655440000",
      "user": {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "role": "owner",
      "created_at": "2026-03-27T10:00:00Z"
    },
    {
      "id": "member-2",
      "project_id": "550e8400-e29b-41d4-a716-446655440000",
      "user": {
        "id": "user-456",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "role": "member",
      "created_at": "2026-03-27T10:05:00Z"
    }
  ],
  "meta": {
    "version": "1.0"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not a member of the project
- `404 Not Found`: Project does not exist

---

#### Add Project Member

```http
POST /api/v1/projects/{projectId}/members
```

**Description**: Adds a new member to a team project.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | Project ID |

**Request Body**:

```json
{
  "user_id": "user-789",
  "role": "member"
}
```

**Fields**:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `user_id` | string (UUID) | Yes | Valid user ID |
| `role` | string | Yes | `owner` or `member` |

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "member-3",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "user": {
      "id": "user-789",
      "name": "Bob Smith",
      "email": "bob@example.com"
    },
    "role": "member",
    "created_at": "2026-03-27T10:10:00Z"
  },
  "meta": {
    "version": "1.0"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation error or user already a member
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not an owner
- `404 Not Found`: Project or user does not exist

---

#### Remove Project Member

```http
DELETE /api/v1/projects/{projectId}/members/{memberId}
```

**Description**: Removes a member from a team project.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string (UUID) | Yes | Project ID |
| `memberId` | string (UUID) | Yes | Member ID |

**Response**: `204 No Content`

**Error Responses**:
- `400 Bad Request`: Cannot remove the last owner
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not an owner
- `404 Not Found**: Member does not exist

---

## Summary

**Total Endpoints**: 13
- Projects: 5 endpoints (list, get, create, update, delete)
- Issues: 5 endpoints (list, get, create, update, delete)
- Project Members: 3 endpoints (list, add, remove)

**Authentication**: All endpoints require authentication via session cookie

**Authorization**: Project-level membership checks for team projects

**Pagination**:
- Projects: Offset-based (page/limit)
- Issues: Cursor-based (cursor/limit)

---

**Document Status**: ✅ Final
**All endpoints defined with request/response contracts**
