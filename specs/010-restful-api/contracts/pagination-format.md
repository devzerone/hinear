# Pagination Format Contract

**Version**: 1.0
**Date**: 2026-03-27

## Overview

This document defines the pagination strategies and response formats for paginated API endpoints. The Hinear API uses two pagination strategies:

1. **Offset-Based Pagination**: For smaller datasets with random access requirements (Projects)
2. **Cursor-Based Pagination**: For larger datasets with real-time updates (Issues)

---

## Offset-Based Pagination (Projects)

### Use Case

Projects typically have fewer items (<100 per user) and users benefit from being able to jump to specific pages.

### Request Format

**Query Parameters**:

| Parameter | Type | Required | Default | Limits | Description |
|-----------|------|----------|---------|--------|-------------|
| `page` | integer | No | 1 | ≥ 1 | Page number (1-indexed) |
| `limit` | integer | No | 20 | 1-100 | Items per page |

**Example Request**:

```http
GET /api/v1/projects?page=2&limit=20
```

### Response Format

```typescript
interface OffsetPaginationResponse<T> {
  items: T[];
  total: number;        // Total number of items
  page: number;         // Current page number
  limit: number;        // Items per page
  totalPages: number;   // Total number of pages
  hasNext: boolean;     // Whether there is a next page
  hasPrev: boolean;     // Whether there is a previous page
}
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "proj-1", "name": "Project 1" },
      { "id": "proj-2", "name": "Project 2" }
    ],
    "total": 42,
    "page": 2,
    "limit": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": true
  },
  "meta": {
    "version": "1.0"
  }
}
```

### Calculation Logic

```typescript
const totalPages = Math.ceil(total / limit);
const hasNext = page < totalPages;
const hasPrev = page > 1;
```

### Edge Cases

**Page Beyond Available Data**:

```http
GET /api/v1/projects?page=999
```

**Response**:

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 42,
    "page": 999,
    "limit": 20,
    "totalPages": 3,
    "hasNext": false,
    "hasPrev": true
  }
}
```

**Negative or Zero Page**:

```http
GET /api/v1/projects?page=0
```

**Response**: `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Page must be >= 1",
    "details": {
      "field": "page",
      "value": 0
    }
  }
}
```

**Limit Exceeds Maximum**:

```http
GET /api/v1/projects?limit=200
```

**Response**: `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Limit cannot exceed 100",
    "details": {
      "field": "limit",
      "value": 200,
      "max": 100
    }
  }
}
```

### URL Construction

**First Page**:

```http
GET /api/v1/projects?page=1&limit=20
```

**Next Page**:

```http
GET /api/v1/projects?page=2&limit=20
```

**Previous Page**:

```http
GET /api/v1/projects?page=1&limit=20
```

**Last Page**:

```http
GET /api/v1/projects?page=3&limit=20
```

---

## Cursor-Based Pagination (Issues)

### Use Case

Issues can have large datasets (1000+ per project) with frequent updates. Cursor-based pagination provides better performance and consistency with real-time data.

### Request Format

**Query Parameters**:

| Parameter | Type | Required | Default | Limits | Description |
|-----------|------|----------|---------|--------|-------------|
| `cursor` | string | No | - | - | Opaque cursor from previous page |
| `limit` | integer | No | 20 | 1-100 | Items per page |

**Example Request (First Page)**:

```http
GET /api/v1/projects/{projectId}/issues?limit=20
```

**Example Request (Next Page)**:

```http
GET /api/v1/projects/{projectId}/issues?cursor=eyJjcmVhdGVkX2F0IjoiMjAyNi0wMy0yN1QxMDowMDowMFoiLCJpZCI6Imlzc3VlLTEyMyJ9&limit=20
```

### Response Format

```typescript
interface CursorPaginationResponse<T> {
  items: T[];
  nextCursor: string | null;  // Cursor for next page, null if last page
  hasMore: boolean;           // Whether there are more items
}
```

**Example Response (First Page)**:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "issue-1",
        "identifier": "WEB-1",
        "title": "Fix navigation bug",
        "created_at": "2026-03-27T10:05:00Z"
      },
      {
        "id": "issue-2",
        "identifier": "WEB-2",
        "title": "Update homepage",
        "created_at": "2026-03-27T10:00:00Z"
      }
    ],
    "nextCursor": "eyJjcmVhdGVkX2F0IjoiMjAyNi0wMy0yN1QxMDowMDowMFwiLCJpZCI6Imlzc3VlLTIifQ==",
    "hasMore": true
  },
  "meta": {
    "version": "1.0"
  }
}
```

**Example Response (Last Page)**:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "issue-20",
        "identifier": "WEB-20",
        "title": "Database optimization",
        "created_at": "2026-03-27T09:00:00Z"
      }
    ],
    "nextCursor": null,
    "hasMore": false
  },
  "meta": {
    "version": "1.0"
  }
}
```

### Cursor Encoding

**Cursor Structure**:

```typescript
interface CursorData {
  createdAt: string;  // ISO 8601 timestamp
  id: string;         // Resource ID
}
```

**Encoding**:

```typescript
function encodeCursor(createdAt: string, id: string): string {
  const data = JSON.stringify({ createdAt, id });
  return Buffer.from(data).toString('base64url');
}

function decodeCursor(cursor: string): CursorData {
  const data = Buffer.from(cursor, 'base64url').toString();
  return JSON.parse(data);
}
```

**Example**:

```typescript
// Input
const createdAt = "2026-03-27T10:00:00Z";
const id = "issue-123";

// Encoded cursor
const cursor = encodeCursor(createdAt, id);
// "eyJjcmVhdGVkX2F0IjoiMjAyNi0wMy0yN1QxMDowMDowMFoiLCJpZCI6Imlzc3VlLTEyMyJ9"

// Decoded
const decoded = decodeCursor(cursor);
// { createdAt: "2026-03-27T10:00:00Z", id: "issue-123" }
```

### Database Query

**With Cursor**:

```sql
SELECT * FROM issues
WHERE project_id = $1
  AND (created_at, id) > ($2, $3)
ORDER BY created_at DESC, id DESC
LIMIT $4;
```

**Without Cursor (First Page)**:

```sql
SELECT * FROM issues
WHERE project_id = $1
ORDER BY created_at DESC, id DESC
LIMIT $2;
```

### Edge Cases

**Invalid Cursor**:

```http
GET /api/v1/projects/{projectId}/issues?cursor=invalid-base64
```

**Response**: `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid cursor format",
    "details": {
      "field": "cursor"
    }
  }
}
```

**Cursor from Deleted Item**:

If a cursor references an item that has been deleted, the API should:

1. Decode the cursor to extract the timestamp and ID
2. Return items after that timestamp, ignoring the deleted ID
3. Continue pagination normally

**Empty Result Set**:

```http
GET /api/v1/projects/{projectId}/issues
```

**Response**:

```json
{
  "success": true,
  "data": {
    "items": [],
    "nextCursor": null,
    "hasMore": false
  }
}
```

---

## Sorting and Filtering with Pagination

### Sorting

Both pagination strategies support sorting via query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort` | string | `created_at` | Field to sort by |
| `order` | string | `desc` | Sort order (`asc` or `desc`) |

**Example**:

```http
GET /api/v1/projects?sort=name&order=asc
```

**Offset-Based**: Works with any sortable field

**Cursor-Based**: Cursor must include the sort field to maintain consistency

```typescript
// For cursor-based with custom sort
interface SortableCursor {
  sortField: string;  // Field being sorted
  value: string;      // Value of sort field
  id: string;         // Resource ID (tiebreaker)
}
```

### Filtering

Filters are applied before pagination:

```http
GET /api/v1/projects/{projectId}/issues?status=Todo&priority=High
```

**Behavior**:
1. Apply filters to get filtered result set
2. Paginate the filtered results
3. Return paginated, filtered items

**Important**: `total` in offset-based pagination reflects the **filtered** total, not the total items in the database.

---

## Client-Side Implementation

### Offset-Based Pagination (TypeScript)

```typescript
interface OffsetPaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

async function fetchProjects(
  state: OffsetPaginationState
): Promise<OffsetPaginationResponse<Project>> {
  const params = new URLSearchParams({
    page: state.page.toString(),
    limit: state.limit.toString(),
  });

  const response = await fetch(`/api/v1/projects?${params}`);
  const data = await response.json();

  return data.data;
}

// Usage
let state: OffsetPaginationState = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

async function loadPage(page: number) {
  state.page = page;
  const result = await fetchProjects(state);

  state.total = result.total;
  state.totalPages = result.totalPages;

  // Render items
  renderItems(result.items);

  // Update pagination controls
  updatePaginationControls({
    currentPage: result.page,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev,
  });
}
```

### Cursor-Based Pagination (TypeScript)

```typescript
interface CursorPaginationState {
  cursor: string | null;
  limit: number;
  hasMore: boolean;
}

async function fetchIssues(
  projectId: string,
  state: CursorPaginationState
): Promise<CursorPaginationResponse<Issue>> {
  const params = new URLSearchParams({
    limit: state.limit.toString(),
  });

  if (state.cursor) {
    params.set('cursor', state.cursor);
  }

  const response = await fetch(
    `/api/v1/projects/${projectId}/issues?${params}`
  );
  const data = await response.json();

  return data.data;
}

// Usage
let state: CursorPaginationState = {
  cursor: null,
  limit: 20,
  hasMore: true,
};

let allIssues: Issue[] = [];

async function loadNextPage() {
  if (!state.hasMore) return;

  const result = await fetchIssues(projectId, state);

  // Append new items
  allIssues = [...allIssues, ...result.items];

  // Update state
  state.cursor = result.nextCursor;
  state.hasMore = result.hasMore;

  // Render new items
  renderItems(result.items);

  // Update "Load More" button visibility
  updateLoadMoreButton(result.hasMore);
}

function resetPagination() {
  state = {
    cursor: null,
    limit: 20,
    hasMore: true,
  };
  allIssues = [];
}
```

---

## Performance Considerations

### Offset-Based Pagination

**Advantages**:
- Easy to implement
- Supports random page access
- Predictable page numbers

**Disadvantages**:
- Performance degrades with large offsets (O(N) query time)
- Can miss or duplicate items if data changes during pagination
- Total count query can be slow on large tables

**Best For**:
- Small to medium datasets (< 10,000 items)
- Rarely changing data
- Random page access requirements

### Cursor-Based Pagination

**Advantages**:
- Consistent performance regardless of offset (O(limit) query time)
- No missed or duplicated items if data is added/removed
- No total count query needed

**Disadvantages**:
- Cannot jump to arbitrary pages
- Cursors can become invalid if items are deleted
- Slightly more complex implementation

**Best For**:
- Large datasets (> 10,000 items)
- Frequently changing data
- Sequential access patterns (infinite scroll)

---

## Migration Strategy

If you need to change pagination strategies in the future:

1. **Introduce new field alongside old field**:
   ```json
   {
     "data": {
       "items": [...],
       // Old offset-based fields (deprecated)
       "page": 1,
       "total": 100,
       // New cursor-based fields
       "nextCursor": "...",
       "hasMore": true
     }
   }
   ```

2. **Add deprecation warning**:
   ```json
   {
     "meta": {
       "version": "1.0",
       "deprecation": {
         "fields": ["page", "total"],
         "useInstead": ["nextCursor", "hasMore"],
         "sunsetDate": "2027-06-27"
       }
     }
   }
   ```

3. **Remove old fields in v2**

---

## Summary

| Feature | Offset-Based | Cursor-Based |
|---------|--------------|--------------|
| **Used For** | Projects | Issues |
| **Page Access** | Random (jump to page N) | Sequential only |
| **Performance** | O(page × limit) | O(limit) |
| **Data Consistency** | Can miss/duplicate items | Consistent |
| **Complexity** | Simple | Moderate |
| **Total Count** | Yes | No |

---

**Document Status**: ✅ Final
**Both pagination strategies defined with examples and implementation guidelines**
