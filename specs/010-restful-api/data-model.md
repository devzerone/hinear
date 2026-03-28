# Data Model: RESTful API Design

**Feature**: RESTful API Design
**Date**: 2026-03-27
**Status**: Final

## Overview

This document defines the data model for the RESTful API. The API exposes three primary domain entities: **Projects**, **Issues**, and **Project Members**. These entities follow the existing Hinear domain model with relationships and validation rules.

---

## Entity Definitions

### 1. Project

**Description**: A project is the top-level container for issues. Each project is either `personal` (owned by a single user) or `team` (collaborative with multiple members).

**Fields**:

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string (UUID) | Yes | Auto-generated | Unique identifier |
| `name` | string | Yes | Min 1, Max 100 chars | Human-readable name |
| `key` | string | Yes | 2-10 uppercase letters | Project key for issue identifiers (e.g., "WEB") |
| `type` | enum | Yes | `personal` \| `team` | Project type |
| `description` | string | No | Max 1000 chars | Optional description |
| `owner_id` | string (UUID) | Yes | Valid user ID | Project owner |
| `created_at` | timestamp | Yes | Auto-generated | Creation timestamp |
| **updated_at** | timestamp | Yes | Auto-generated | Last update timestamp |

**Relationships**:
- **Has Many**: Issues (one project has many issues)
- **Has Many**: Project Members (for team projects)

**State Transitions**: None (projects are immutable in type)

**Validation Rules**:
- `key` must be unique across all projects owned by the user
- `key` must contain only uppercase letters (A-Z)
- `name` cannot be empty
- `type` cannot be changed after creation

---

### 2. Issue

**Description**: An issue represents a task, bug, or feature request within a project. Issues have a project-scoped identifier (e.g., `WEB-1`) and support rich metadata.

**Fields**:

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string (UUID) | Yes | Auto-generated | Unique identifier |
| `project_id` | string (UUID) | Yes | Valid project ID | Foreign key to Project |
| `identifier` | string | Yes | `{PROJECT_KEY}-{n}` | Project-scoped ID (e.g., "WEB-1") |
| `title` | string | Yes | Min 1, Max 200 chars | Issue title |
| `description` | string | No | Max 10000 chars | Markdown-supported description |
| `status` | enum | Yes | Default: `Triage` | `Triage` \| `Backlog` \| `Todo` \| `In Progress` \| `Done` |
| `priority` | enum | Yes | Default: `Medium` | `Low` \| `Medium` \| `High` \| `Critical` |
| `assignee_id` | string (UUID) | No | Valid user ID | Assigned user (must be project member) |
| `creator_id` | string (UUID) | Yes | Valid user ID | User who created the issue |
| `created_at` | timestamp | Yes | Auto-generated | Creation timestamp |
| `updated_at` | timestamp | Yes | Auto-generated | Last update timestamp |
| `version` | integer | Yes | Auto-increment | Optimistic locking version |

**Relationships**:
- **Belongs To**: Project (many issues belong to one project)
- **Belongs To**: Creator (many issues created by one user)
- **Belongs To**: Assignee (optional, many issues assigned to one user)
- **Has Many**: Labels (many-to-many relationship)
- **Has Many**: Comments (one issue has many comments)
- **Has Many**: Activity Log Entries (audit trail)

**State Transitions**:

```
Triage → Backlog → Todo → In Progress → Done
   ↓         ↓        ↓           ↓         ↓
   └─────────┴────────┴───────────┴─────────┘
              (can move to any status)
```

**Validation Rules**:
- `identifier` must be unique within the project
- `assignee_id` must be a member of the project (for team projects)
- `status` transitions are unrestricted (users can move to any status)
- `priority` is required and cannot be null
- `version` increments on each update (optimistic locking)

---

### 3. Project Member

**Description**: Represents a user's access to a team project. Each member has a role (`owner` or `member`) that determines their permissions.

**Fields**:

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string (UUID) | Yes | Auto-generated | Unique identifier |
| `project_id` | string (UUID) | Yes | Valid project ID | Foreign key to Project |
| `user_id` | string (UUID) | Yes | Valid user ID | Member user ID |
| `role` | enum | Yes | `owner` \| `member` | Member role |
| `created_at` | timestamp | Yes | Auto-generated | Addition timestamp |
| **updated_at** | timestamp | Yes | Auto-generated | Last update timestamp |

**Relationships**:
- **Belongs To**: Project (many members belong to one project)
- **Belongs To**: User (many memberships for one user across projects)

**State Transitions**: None (roles can be changed but no formal state machine)

**Validation Rules**:
- A user can only be added once to a project (unique constraint on `project_id` + `user_id`)
- `owner` role cannot be removed (at least one owner must remain)
- Only `owner` can add/remove members
- Personal projects do not have members (only the owner)

**Permissions by Role**:

| Action | Owner | Member |
|--------|-------|--------|
| View project | ✅ | ✅ |
| Edit project | ✅ | ❌ |
| Delete project | ✅ | ❌ |
| Add members | ✅ | ❌ |
| Remove members | ✅ | ❌ |
| Create issues | ✅ | ✅ |
| Edit any issue | ✅ | ✅ |
| Delete any issue | ✅ | ✅ |

---

### 4. Label (Issue Metadata)

**Description**: Labels are tags that can be applied to issues for categorization and filtering. Labels are project-scoped.

**Fields**:

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string (UUID) | Yes | Auto-generated | Unique identifier |
| `project_id` | string (UUID) | Yes | Valid project ID | Foreign key to Project |
| `name` | string | Yes | Min 1, Max 50 chars | Label name |
| `color` | string | Yes | Hex color code | 6-digit hex (e.g., "#FF5733") |
| `created_at` | timestamp | Yes | Auto-generated | Creation timestamp |

**Relationships**:
- **Belongs To**: Project (many labels belong to one project)
- **Has Many**: Issues (many-to-many relationship via `issue_labels` junction table)

**Validation Rules**:
- `name` must be unique within the project
- `color` must be a valid hex color code

---

### 5. Comment (Issue Discussion)

**Description**: Comments represent discussion on issues. Users can add comments to collaborate on issue resolution.

**Fields**:

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | string (UUID) | Yes | Auto-generated | Unique identifier |
| `issue_id` | string (UUID) | Yes | Valid issue ID | Foreign key to Issue |
| `author_id` | string (UUID) | Yes | Valid user ID | Comment author |
| `content` | string | Yes | Min 1, Max 5000 chars | Comment content (Markdown) |
| `created_at` | timestamp | Yes | Auto-generated | Creation timestamp |
| **updated_at** | timestamp | Yes | Auto-generated | Last edit timestamp |

**Relationships**:
- **Belongs To**: Issue (many comments belong to one issue)
- **Belongs To**: Author (many comments written by one user)

**Validation Rules**:
- `content` cannot be empty
- Comments can only be edited by the author or project owners
- Comments are deleted when the issue is deleted (cascade)

---

## Entity Relationship Diagram

```
┌─────────────┐
│   Project   │
├─────────────┤
│ id (PK)     │
│ name        │
│ key         │
│ type        │
│ owner_id    │
└─────────────┘
      │
      │ 1:N
      ├────────────────────┐
      │                    │
      ▼                    ▼
┌─────────────┐    ┌──────────────┐
│   Issue     │    │ProjectMember │
├─────────────┤    ├──────────────┤
│ id (PK)     │    │ id (PK)      │
│ project_id  │◄───│ project_id   │
│ identifier  │    │ user_id      │
│ title       │    │ role         │
│ status      │    └──────────────┘
│ priority    │
│ assignee_id │
│ creator_id  │
│ version     │
└─────────────┘
      │
      │ N:M
      ▼
┌─────────────┐
│    Label    │
├─────────────┤
│ id (PK)     │
│ project_id  │
│ name        │
│ color       │
└─────────────┘

┌─────────────┐
│   Comment   │
├─────────────┤
│ id (PK)     │
│ issue_id    │◄───┐
│ author_id   │    │
│ content     │    │
└─────────────┘    │
                   │
       ┌───────────┘
       │
       ▼
┌─────────────┐
│   Issue     │
└─────────────┘
```

---

## API Resource Representation

### Project Resource

```typescript
interface ProjectResource {
  id: string;
  name: string;
  key: string;
  type: 'personal' | 'team';
  description?: string;
  owner_id: string;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}

// Project list response (includes pagination metadata)
interface ProjectListResource {
  items: ProjectResource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### Issue Resource

```typescript
interface IssueResource {
  id: string;
  project_id: string;
  identifier: string;  // e.g., "WEB-1"
  title: string;
  description?: string;
  status: 'Triage' | 'Backlog' | 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
  labels: LabelResource[];
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
  version: number;
}

// Issue list response (cursor-based pagination)
interface IssueListResource {
  items: IssueResource[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

### Project Member Resource

```typescript
interface ProjectMemberResource {
  id: string;
  project_id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: 'owner' | 'member';
  created_at: string;  // ISO 8601
}
```

### Label Resource

```typescript
interface LabelResource {
  id: string;
  project_id: string;
  name: string;
  color: string;  // Hex color code
}
```

### Comment Resource

```typescript
interface CommentResource {
  id: string;
  issue_id: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  content: string;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}
```

---

## Validation Summary

### Request Validation

All API requests will be validated using Zod schemas before processing:

```typescript
// Create project validation
const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  key: z.string().regex(/^[A-Z]{2,10}$/),
  type: z.enum(['personal', 'team']),
  description: z.string().max(1000).optional(),
});

// Create issue validation
const CreateIssueSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  status: z.enum(['Triage', 'Backlog', 'Todo', 'In Progress', 'Done']).default('Triage'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  assignee_id: z.string().uuid().optional(),
  label_ids: z.array(z.string().uuid()).optional(),
});
```

### Response Validation

All API responses will conform to the resource schemas defined above. Contract tests will validate response structure using Zod schemas.

---

## Next Steps

With the data model defined, proceed to creating the API contracts in the `/contracts/` directory:

1. [contracts/api-endpoints.md](contracts/api-endpoints.md) - All API endpoints with methods and schemas
2. [contracts/error-responses.md](contracts/error-responses.md) - Error response structure
3. [contracts/pagination-format.md](contracts/pagination-format.md) - Pagination metadata format

---

**Document Status**: ✅ Final
**All entities defined with validation rules and relationships**
