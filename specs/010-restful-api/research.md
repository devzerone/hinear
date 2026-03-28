# Research Document: RESTful API Design

**Feature**: RESTful API Design
**Date**: 2026-03-27
**Status**: Complete

## Overview

This document consolidates research findings for implementing RESTful APIs in the Hinear project using Next.js App Router. All research decisions are documented with rationale and alternatives considered.

---

## 1. Next.js App Router API Routes

**Decision**: Use Next.js 13+ App Router `route.ts` files with standard HTTP method exports

**Rationale**:
- Native Next.js pattern - no additional framework needed
- Full TypeScript support with type-safe request/response
- Leverages existing Next.js infrastructure (middleware, caching, deployment)
- Clear separation of concerns with file-system based routing
- Built-in edge runtime support for future performance needs

**Implementation Pattern**:

```typescript
// src/app/api/v1/projects/[id]/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // ... business logic ...
    return apiSuccess(data);
  } catch (error) {
    return apiError("Failed to load project", 500);
  }
}

export async function PUT(/* ... */) { /* ... */ }
export async function PATCH(/* ... */) { /* ... */ }
export async function DELETE(/* ... */) { /* ... */ }
```

**Key Practices**:
- Export named HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Use `NextRequest` for typed access to headers, search params, body
- Return `Response` objects with appropriate status codes
- Centralize error handling in shared utilities
- Use TypeScript for request/response type safety

**Alternatives Considered**:
- **Express.js custom server**: Rejected because it sacrifices Next.js features (ISR, revalidation, edge functions)
- **API middleware (tRPC, NextApi)**: Rejected because project needs standard RESTful API for integrations, not type-safe RPC
- **Server Actions only**: Rejected because spec requires RESTful endpoints for external integrations

---

## 2. API Versioning Strategy

**Decision**: URL-based versioning with `/api/v1/` path prefix

**Rationale**:
- Clear and explicit - version is visible in browser DevTools and logs
- Aligns with Next.js file-system routing (`app/api/v1/...`)
- Industry standard (GitHub, Stripe, Slack)
- Easy to document, test, and debug
- Natural separation between versions in codebase

**Implementation Structure**:

```text
src/app/api/
├── v1/
│   ├── projects/
│   │   ├── route.ts              # GET /api/v1/projects, POST /api/v1/projects
│   │   └── [id]/
│   │       └── route.ts          # GET/PATCH/DELETE /api/v1/projects/{id}
│   ├── v1/
│   │   └── [projectId]/
│   │       ├── issues/
│   │       │   ├── route.ts      # GET/POST /api/v1/projects/{projectId}/issues
│   │       │   └── [issueId]/
│   │       │       └── route.ts  # GET/PATCH/DELETE /api/v1/projects/{projectId}/issues/{issueId}
│   │       └── members/
│   │           └── route.ts      # GET/POST /api/v1/projects/{projectId}/members
│   └── _lib/
│       ├── version.ts            # Version header utilities
│       └── response.ts           # Response helpers
└── _lib/
    └── response.ts               # Shared response utilities
```

**Version Headers**:
```typescript
// All responses include
X-API-Version: 1.0

// Deprecated responses include
X-API-Deprecated: true
Sunset: 2027-06-27T00:00:00Z
Link: <https://docs.hinear.com/api/v2>; rel="successor-version"
```

**Migration Timeline**:
- **Announcement**: 12 months before sunset
- **Deprecation Warning**: 6 months (headers + response body warnings)
- **Soft Shutdown**: 1-2 months (410 Gone for very old clients)
- **Hard Shutdown**: After 12 months total

**Alternatives Considered**:
- **Header versioning** (`Accept: application/vnd.api.v1+json`): Rejected due to poor DX and Next.js complexity
- **Query parameter versioning** (`?version=1`): Rejected as not RESTful and causes caching issues
- **No versioning**: Rejected because API will evolve and breaking changes are inevitable

---

## 3. Pagination Strategy

**Decision**: Cursor-based pagination with forward-only navigation for issues, offset-based for projects

**Rationale**:
- **Issues (Cursor-based)**: Large datasets (1000+ per project), real-time updates, infinite scroll UX
- **Projects (Offset-based)**: Smaller datasets (<100 per user), need for page jumping, simpler sorting

**Implementation**:

```typescript
// Issues: Cursor-based pagination
interface CursorPaginationParams {
  cursor?: string;      // Opaque cursor from previous page
  limit?: number;       // Default 20, max 100
}

interface CursorPaginationResponse<T> {
  items: T[];
  nextCursor: string | null;  // Null indicates last page
  hasMore: boolean;
}

// GET /api/v1/projects/{projectId}/issues?cursor=abc123&limit=20

// Projects: Offset-based pagination
interface OffsetPaginationParams {
  page?: number;        // Default 1
  limit?: number;       // Default 20, max 100
}

interface OffsetPaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// GET /api/v1/projects?page=1&limit=20
```

**Cursor Implementation** (Issues):
```typescript
// Use created_at + id as composite cursor
function encodeCursor(timestamp: string, id: string): string {
  return Buffer.from(`${timestamp}|${id}`).toString('base64url');
}

function decodeCursor(cursor: string): { timestamp: string; id: string } {
  const [timestamp, id] = Buffer.from(cursor, 'base64url').toString().split('|');
  return { timestamp, id };
}

// Query with cursor
const { timestamp, id } = decodeCursor(cursor);
const issues = await db.query(`
  SELECT * FROM issues
  WHERE project_id = $1
    AND (created_at, id) > ($2, $3)
  ORDER BY created_at ASC, id ASC
  LIMIT $4
`, [projectId, timestamp, id, limit]);
```

**Offset Implementation** (Projects):
```typescript
const offset = (page - 1) * limit;
const projects = await db.query(`
  SELECT * FROM projects
  WHERE owner_id = $1
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3
`, [userId, limit, offset]);

const total = await db.query(`
  SELECT COUNT(*) FROM projects WHERE owner_id = $1
`, [userId]);
```

**Alternatives Considered**:
- **Offset-only for all**: Rejected due to performance issues with large issue tables (O(N) slowdown)
- **Cursor-only for all**: Rejected because projects need page jumping UX (users want to go to page 5 directly)
- **Keyset pagination**: Rejected because cursor-based provides same benefits with better abstraction

---

## 4. Error Response Format

**Decision**: Custom simple format with RFC 7807-inspired structure

**Rationale**:
- Simple and developer-friendly
- Extensible for future error types
- No external dependencies
- Clear error codes for programmatic handling
- Human-readable messages

**Error Response Structure**:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: unknown;      // Additional error context
    requestId?: string;     // For support troubleshooting
    timestamp: string;      // ISO 8601 timestamp
  };
}

// Example: Validation error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "title": ["Title is required"],
        "priority": ["Priority must be one of: Low, Medium, High"]
      }
    },
    "requestId": "req_abc123",
    "timestamp": "2026-03-27T14:30:00Z"
  }
}

// Example: Not found
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found",
    "details": {
      "resource": "Project",
      "id": "proj_123"
    },
    "requestId": "req_def456",
    "timestamp": "2026-03-27T14:30:00Z"
  }
}
```

**Standard Error Codes**:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required or failed |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (optimistic locking) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

**Success Response Structure**:

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    version: string;
    deprecated?: boolean;
    [key: string]: unknown;
  };
}
```

**Alternatives Considered**:
- **RFC 7807 Problem Details**: Rejected due to verbosity and limited adoption in simple APIs
- **JSON:API Error Format**: Rejected as too complex for project's needs
- **Google API Error Format**: Rejected due to complexity and over-engineering

---

## 5. OpenAPI/Swagger Integration

**Decision**: Manual OpenAPI specification with automatic type generation from TypeScript

**Rationale**:
- Full control over API documentation
- Type safety between code and docs
- No runtime overhead
- Can generate docs from TypeScript types
- Supports multiple documentation UIs (Swagger UI, Redoc)

**Implementation Strategy**:

```typescript
// lib/openapi/spec.ts
import { createOpenApiSpec } from 'openapi-typescript';

export const openApiSpec = createOpenApiSpec({
  openapi: '3.1.0',
  info: {
    title: 'Hinear API',
    version: '1.0.0',
    description: 'Project-first issue management API',
  },
  servers: [
    { url: 'https://api.hinear.com/v1', description: 'Production' },
    { url: 'http://localhost:3000/api/v1', description: 'Development' },
  ],
  paths: {
    '/projects': {
      get: {
        summary: 'List projects',
        tags: ['Projects'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 }
          }
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: ProjectListResponse
              }
            }
          }
        }
      }
    }
  }
});
```

**Type Generation**:

```typescript
// Generate types from OpenAPI spec
// npm install -D openapi-typescript

// openapi.config.ts
export default {
  schema: {
    ProjectsResponse: {
      success: true,
      data: [
        {
          id: string,
          name: string,
          type: 'personal' | 'team'
        }
      ],
      meta: {
        total: number,
        page: number,
        limit: number
      }
    }
  }
};

// Generate types: npx openapi-typescript openapi.config.ts -o src/api-types.ts
```

**Documentation Hosting**:

```typescript
// app/docs/route.ts
import { createSwaggerUI } from 'swagger-ui-express';

export const GET = createSwaggerUI({
  spec: openApiSpec,
  title: 'Hinear API Documentation',
});
```

**Alternatives Considered**:
- **Automatic generation from routes**: Rejected due to Next.js complexity and lack of mature tools
- **Decorator-based libraries**: Rejected because Next.js doesn't support decorators well
- **No documentation**: Rejected because spec requires API documentation (SC-007)

---

## 6. Testing Strategy

**Decision**: Integration tests with Vitest + fake database clients, contract tests with Zod

**Rationale**:
- Leverages existing Vitest setup
- Fast execution with fake clients (no database overhead)
- Type-safe contract validation with Zod
- Tests API contracts independently of implementation

**Test Structure**:

```text
tests/
├── api/
│   ├── projects/
│   │   ├── list-projects.test.ts
│   │   ├── get-project.test.ts
│   │   ├── create-project.test.ts
│   │   ├── update-project.test.ts
│   │   └── delete-project.test.ts
│   ├── issues/
│   │   ├── list-issues.test.ts
│   │   ├── get-issue.test.ts
│   │   ├── create-issue.test.ts
│   │   ├── update-issue.test.ts
│   │   └── delete-issue.test.ts
│   └── contracts/
│       └── api-contracts.test.ts     # Zod schema validation
├── helpers/
│   ├── fake-client.ts                # Fake Supabase client
│   ├── auth-mocks.ts                 # Authentication mocks
│   └── test-data.ts                  # Test data generators
```

**Example Test**:

```typescript
// tests/api/projects/create-project.test.ts
import { POST } from '@/app/api/v1/projects/route';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createProjectMock: vi.fn(),
  getAuthenticatedActorIdOrNullMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server-auth', () => ({
  getAuthenticatedActorIdOrNull: mocks.getAuthenticatedActorIdOrNullMock,
}));

vi.mock('@/features/projects/repositories/server-projects-repository', () => ({
  getServerProjectsRepository: () => ({
    createProject: mocks.createProjectMock,
  }),
}));

describe('POST /api/v1/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedActorIdOrNullMock.mockResolvedValue('user-1');
  });

  it('creates a project with valid input', async () => {
    const payload = {
      name: 'My Project',
      type: 'personal',
    };

    mocks.createProjectMock.mockResolvedValue({
      id: 'proj-1',
      name: payload.name,
      type: payload.type,
      key: 'MY',
    });

    const response = await POST(
      new Request('https://hinear.test/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: expect.objectContaining({
        name: payload.name,
        key: 'MY',
      }),
    });
  });

  it('returns 400 for invalid input', async () => {
    const response = await POST(
      new Request('https://hinear.test/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify({ name: '' }), // Missing required fields
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
      },
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mocks.getAuthenticatedActorIdOrNullMock.mockResolvedValue(null);

    const response = await POST(
      new Request('https://hinear.test/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', type: 'personal' }),
      })
    );

    expect(response.status).toBe(401);
  });
});
```

**Contract Test**:

```typescript
// tests/api/contracts/api-contracts.test.ts
import { z } from 'zod';
import { POST } from '@/app/api/v1/projects/route';

const ProjectResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['personal', 'team']),
    key: z.string(),
  }),
});

describe('API Contract Tests', () => {
  it('returns valid project response schema', async () => {
    const response = await POST(
      new Request('https://hinear.test/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', type: 'personal' }),
      })
    );

    const data = await response.json();
    const result = ProjectResponseSchema.safeParse(data);

    expect(result.success).toBe(true);
  });
});
```

**Alternatives Considered**:
- **Supertest**: Rejected because Vitest has native support for Next.js route handlers
- **Playwright API testing**: Rejected as overkill for unit/integration tests
- **Test database**: Rejected due to setup complexity; fake clients provide sufficient coverage

---

## 7. Performance Optimization

**Decision**: Connection pooling, selective field loading, response caching, and pagination

**Rationale**:
- Meets 200ms p95 performance target
- Supports 50+ concurrent users
- Leverages Supabase PostgreSQL features
- Aligns with existing performance monitoring (003-performance-audit)

**Optimization Strategies**:

### 7.1 Database Connection Pooling

```typescript
// lib/supabase/server-client.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

let clientInstance: SupabaseClient | null = null;

export function getServerClient() {
  if (clientInstance) {
    return clientInstance;
  }

  const cookieStore = cookies();
  clientInstance = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) { /* ... */ },
        remove(name: string, options: any) { /* ... */ },
      },
    }
  );

  return clientInstance;
}
```

### 7.2 Selective Field Loading

```typescript
// Avoid SELECT *
const issues = await supabase
  .from('issues')
  .select('id, title, status, priority, created_at')  // Only needed fields
  .eq('project_id', projectId)
  .order('created_at', { ascending: false })
  .limit(20);
```

### 7.3 Response Caching

```typescript
// Cache GET requests for 5 minutes
export async function GET(/* ... */) {
  const response = await fetchIssues(projectId);

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
```

### 7.4 Prevent N+1 Queries

```typescript
// ❌ Bad: N+1 queries
const issues = await getIssues(projectId);
for (const issue of issues) {
  issue.labels = await getLabels(issue.id);  // N queries
}

// ✅ Good: Single query with joins
const issues = await supabase
  .from('issues')
  .select(`
    id, title, status,
    labels (
      id, name, color
    )
  `)
  .eq('project_id', projectId);
```

### 7.5 Pagination

Already covered in section 3 - cursor-based for issues, offset-based for projects.

### 7.6 Compression

```typescript
// next.config.js
module.exports = {
  compress: true,  // Enable gzip compression
};
```

**Performance Targets**:

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| API Response (p95) | 200ms | 300ms | 500ms |
| Database Query | 50ms | 100ms | 200ms |
| Concurrent Users | 50 | 75 | 100 |

**Monitoring**:

```typescript
// lib/api/metrics.ts
export async function trackApiMetrics(
  endpoint: string,
  duration: number,
  status: number
) {
  // Log to performance monitoring system
  if (duration > 300) {
    console.warn(`Slow API: ${endpoint} took ${duration}ms`);
  }
}
```

**Alternatives Considered**:
- **Redis caching**: Rejected due to infrastructure complexity; HTTP caching is sufficient
- **Read replicas**: Rejected as overkill for current scale; single PostgreSQL instance is sufficient
- **Edge functions**: Deferred to future optimization; start with Node.js runtime for simplicity

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| Route Handlers | Next.js App Router `route.ts` | Native pattern, full TypeScript support |
| Versioning | URL-based `/api/v1/` | Clear, debuggable, industry standard |
| Pagination (Issues) | Cursor-based | Large datasets, real-time updates |
| Pagination (Projects) | Offset-based | Small datasets, page jumping UX |
| Error Format | Custom simple format | Developer-friendly, extensible |
| Documentation | Manual OpenAPI + types | Full control, type-safe |
| Testing | Vitest + fake clients | Fast, leverages existing setup |
| Performance | Pooling + caching + pagination | Meets 200ms p95 target |

---

## Next Steps

With research complete, proceed to **Phase 1: Design & Contracts**:
1. Create [data-model.md](data-model.md) with entity definitions
2. Create `/contracts/` directory with API specifications
3. Create [quickstart.md](quickstart.md) for developer onboarding
4. Run agent context update script

---

**Document Status**: ✅ Complete
**All NEEDS CLARIFICATION items resolved**
