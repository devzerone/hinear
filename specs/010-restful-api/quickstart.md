# Quickstart Guide: Hinear API

**Version**: 1.0
**Base URL**: `https://api.hinear.com/api/v1`
**Date**: 2026-03-27

## Overview

The Hinear API provides RESTful endpoints for managing projects and issues. This guide will help you get started with the API in under 15 minutes.

---

## Prerequisites

- **Authentication**: Valid user account (session-based authentication)
- **HTTP Client**: cURL, Postman, or any HTTP library
- **JSON**: Request and response bodies use JSON format

---

## Quick Start (5 Minutes)

### 1. Authenticate

The Hinear API uses session-based authentication. First, log in to get a session cookie:

```bash
curl -X POST https://hinear.com/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Response**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "your-email@example.com"
    }
  }
}
```

The session cookie is now saved in `cookies.txt` and will be used for subsequent requests.

### 2. List Your Projects

```bash
curl -X GET https://api.hinear.com/api/v1/projects \
  -b cookies.txt
```

**Response**:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "proj-1",
        "name": "My Project",
        "key": "MY",
        "type": "personal",
        "created_at": "2026-03-27T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 3. Create an Issue

```bash
curl -X POST https://api.hinear.com/api/v1/projects/proj-1/issues \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "My first issue",
    "description": "This is a test issue",
    "status": "Triage",
    "priority": "Medium"
  }'
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "issue-1",
    "identifier": "MY-1",
    "title": "My first issue",
    "status": "Triage",
    "priority": "Medium",
    "created_at": "2026-03-27T10:05:00Z"
  }
}
```

### 4. Get the Issue

```bash
curl -X GET https://api.hinear.com/api/v1/projects/proj-1/issues/issue-1 \
  -b cookies.txt
```

---

## Common Operations

### Create a Project

```bash
curl -X POST https://api.hinear.com/api/v1/projects \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Website Redesign",
    "key": "WEB",
    "type": "personal",
    "description": "Redesign company website"
  }'
```

### List Project Members

```bash
curl -X GET https://api.hinear.com/api/v1/projects/proj-1/members \
  -b cookies.txt
```

### List Issues with Filtering

```bash
curl -X GET "https://api.hinear.com/api/v1/projects/proj-1/issues?status=Todo&priority=High" \
  -b cookies.txt
```

### Update an Issue

```bash
curl -X PATCH https://api.hinear.com/api/v1/projects/proj-1/issues/issue-1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "In Progress",
    "version": 1
  }'
```

### Remove a Project Member

```bash
curl -X DELETE https://api.hinear.com/api/v1/projects/proj-1/members/user-2 \
  -b cookies.txt
```

### Delete an Issue

```bash
curl -X DELETE https://api.hinear.com/api/v1/projects/proj-1/issues/issue-1 \
  -b cookies.txt
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "title": ["Title is required"]
      }
    },
    "requestId": "req_abc123",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

**Always check the `success` field first**:

```javascript
const response = await fetch('/api/v1/projects');
const data = await response.json();

if (!data.success) {
  console.error('Error:', data.error.message);
  return;
}

// Process data.data
```

---

## Pagination

### Projects (Offset-Based)

```bash
# Page 1
curl -X GET "https://api.hinear.com/api/v1/projects?page=1&limit=20"

# Page 2
curl -X GET "https://api.hinear.com/api/v1/projects?page=2&limit=20"
```

### Issues (Cursor-Based)

```bash
# First page
curl -X GET "https://api.hinear.com/api/v1/projects/proj-1/issues?limit=20"

# Next page (use nextCursor from previous response)
curl -X GET "https://api.hinear.com/api/v1/projects/proj-1/issues?cursor=BASE64_CURSOR&limit=20"
```

---

## JavaScript Example

```javascript
// Hinear API client
class HinearAPI {
  constructor(baseURL = 'https://api.hinear.com/api/v1') {
    this.baseURL = baseURL;
  }

  async request(method, path, body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include session cookies
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseURL}${path}`, options);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  }

  // Projects
  async listProjects(params = {}) {
    const query = new URLSearchParams(params);
    return this.request('GET', `/projects?${query}`);
  }

  async getProject(projectId) {
    return this.request('GET', `/projects/${projectId}`);
  }

  async createProject(data) {
    return this.request('POST', '/projects', data);
  }

  async updateProject(projectId, data) {
    return this.request('PATCH', `/projects/${projectId}`, data);
  }

  async deleteProject(projectId) {
    return this.request('DELETE', `/projects/${projectId}`);
  }

  // Issues
  async listIssues(projectId, params = {}) {
    const query = new URLSearchParams(params);
    return this.request('GET', `/projects/${projectId}/issues?${query}`);
  }

  async getIssue(projectId, issueId) {
    return this.request('GET', `/projects/${projectId}/issues/${issueId}`);
  }

  async createIssue(projectId, data) {
    return this.request('POST', `/projects/${projectId}/issues`, data);
  }

  async updateIssue(projectId, issueId, data) {
    return this.request('PATCH', `/projects/${projectId}/issues/${issueId}`, data);
  }

  async deleteIssue(projectId, issueId) {
    return this.request('DELETE', `/projects/${projectId}/issues/${issueId}`);
  }
}

// Usage
const api = new HinearAPI();

async function main() {
  try {
    // List projects
    const projects = await api.listProjects({ page: 1, limit: 10 });
    console.log('Projects:', projects.items);

    // Create an issue
    const issue = await api.createIssue('proj-1', {
      title: 'New issue',
      priority: 'High',
    });
    console.log('Created issue:', issue);

    // Update issue
    const updated = await api.updateIssue('proj-1', issue.id, {
      status: 'In Progress',
      version: issue.version,
    });
    console.log('Updated issue:', updated);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

---

## Python Example

```python
import requests

class HinearAPI:
    def __init__(self, base_url='https://api.hinear.com/api/v1'):
        self.base_url = base_url
        self.session = requests.Session()
        # Session cookies will be stored automatically

    def request(self, method, path, data=None):
        url = f'{self.base_url}{path}'
        response = self.session.request(method, url, json=data)
        response_data = response.json()

        if not response_data.get('success'):
            raise Exception(response_data['error']['message'])

        return response_data.get('data')

    # Projects
    def list_projects(self, params=None):
        query = '&'.join(f'{k}={v}' for k, v in (params or {}).items())
        path = f'/projects?{query}' if query else '/projects'
        return self.request('GET', path)

    def get_project(self, project_id):
        return self.request('GET', f'/projects/{project_id}')

    def create_project(self, data):
        return self.request('POST', '/projects', data)

    # Issues
    def list_issues(self, project_id, params=None):
        query = '&'.join(f'{k}={v}' for k, v in (params or {}).items())
        path = f'/projects/{project_id}/issues?{query}' if query else f'/projects/{project_id}/issues'
        return self.request('GET', path)

    def create_issue(self, project_id, data):
        return self.request('POST', f'/projects/{project_id}/issues', data)

# Usage
api = HinearAPI()

try:
    # List projects
    projects = api.list_projects({'page': 1, 'limit': 10})
    print(f'Found {len(projects["items"])} projects')

    # Create an issue
    issue = api.create_issue('proj-1', {
        'title': 'New issue',
        'priority': 'High'
    })
    print(f'Created issue {issue["identifier"]}')

except Exception as error:
    print(f'Error: {error}')
```

---

## cURL Examples

### Authentication

```bash
# Login
curl -X POST https://hinear.com/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "user@example.com", "password": "pass"}'

# Check auth status
curl -X GET https://api.hinear.com/api/v1/auth/me \
  -b cookies.txt
```

### Projects

```bash
# List projects
curl -X GET https://api.hinear.com/api/v1/projects \
  -b cookies.txt

# Get project
curl -X GET https://api.hinear.com/api/v1/projects/proj-1 \
  -b cookies.txt

# Create project
curl -X POST https://api.hinear.com/api/v1/projects \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name": "My Project", "key": "MY", "type": "personal"}'

# Update project
curl -X PATCH https://api.hinear.com/api/v1/projects/proj-1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name": "Updated Project"}'

# Delete project
curl -X DELETE https://api.hinear.com/api/v1/projects/proj-1 \
  -b cookies.txt
```

### Issues

```bash
# List issues (first page)
curl -X GET "https://api.hinear.com/api/v1/projects/proj-1/issues?limit=20" \
  -b cookies.txt

# List issues (filtered)
curl -X GET "https://api.hinear.com/api/v1/projects/proj-1/issues?status=Todo&priority=High" \
  -b cookies.txt

# Get issue
curl -X GET https://api.hinear.com/api/v1/projects/proj-1/issues/issue-1 \
  -b cookies.txt

# Create issue
curl -X POST https://api.hinear.com/api/v1/projects/proj-1/issues \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title": "Fix bug", "priority": "High"}'

# Update issue
curl -X PATCH https://api.hinear.com/api/v1/projects/proj-1/issues/issue-1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"status": "In Progress", "version": 1}'

# Delete issue
curl -X DELETE https://api.hinear.com/api/v1/projects/proj-1/issues/issue-1 \
  -b cookies.txt
```

---

## Testing with Postman

1. **Import Collection**: Download the Hinear API Postman collection
2. **Set Base URL**: `https://api.hinear.com/api/v1`
3. **Configure Authentication**:
   - Go to the "Login" request
   - Send a POST request to `/auth/login` with your credentials
   - Postman will automatically save the session cookie
   - All subsequent requests will include the cookie

---

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Default Limit**: 100 requests per minute per user
- **Rate Limit Headers**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

**When Rate Limited**:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "retryAfter": 45
    }
  }
}
```

---

## Best Practices

### 1. Always Check `success` Field

```javascript
const data = await response.json();

if (!data.success) {
  // Handle error
  console.error(data.error.code, data.error.message);
  return;
}

// Process success
console.log(data.data);
```

### 2. Handle Pagination Correctly

```javascript
// Offset-based (Projects)
let page = 1;
let hasMore = true;

while (hasMore) {
  const result = await api.listProjects({ page, limit: 20 });

  // Process items
  result.items.forEach(item => console.log(item));

  // Check for more pages
  hasMore = result.hasNext;
  page++;
}
```

```javascript
// Cursor-based (Issues)
let cursor = null;
let hasMore = true;

while (hasMore) {
  const params = { limit: 20 };
  if (cursor) params.cursor = cursor;

  const result = await api.listIssues('proj-1', params);

  // Process items
  result.items.forEach(item => console.log(item));

  // Check for more pages
  cursor = result.nextCursor;
  hasMore = result.hasMore;
}
```

### 3. Use Optimistic Locking for Updates

```javascript
// Get current issue version
const issue = await api.getIssue('proj-1', 'issue-1');

// Update with version
try {
  const updated = await api.updateIssue('proj-1', 'issue-1', {
    status: 'In Progress',
    version: issue.version,  // Include current version
  });
} catch (error) {
  if (error.message.includes('Conflict')) {
    // Handle conflict - refresh and retry
    console.log('Issue was modified by another user');
    const fresh = await api.getIssue('proj-1', 'issue-1');
    // Retry with fresh version
  }
}
```

### 4. Filter and Sort Efficiently

```javascript
// Good: Server-side filtering
const issues = await api.listIssues('proj-1', {
  status: 'Todo',
  priority: 'High',
  sort: 'created_at',
  order: 'desc',
});

// Bad: Client-side filtering (don't do this)
const allIssues = await api.listIssues('proj-1');
const todoIssues = allIssues.items.filter(i => i.status === 'Todo');
```

---

## Troubleshooting

### "Authentication Required" Error

**Problem**: You're getting a `401 Unauthorized` response.

**Solution**: Make sure you've logged in and cookies are being sent:

```bash
curl -X GET https://api.hinear.com/api/v1/projects \
  -b cookies.txt \
  -v  # Verbose mode to see headers
```

### "Validation Error" with Required Fields

**Problem**: You're getting a `400 Bad Request` with validation errors.

**Solution**: Check the `details.fields` object:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "fields": {
        "title": ["Title is required"],
        "key": ["Key must be 2-10 uppercase letters"]
      }
    }
  }
}
```

### "Conflict Detected" Error

**Problem**: You're getting a `409 Conflict` when updating an issue.

**Solution**: The issue was modified by another user. Refresh and retry:

```javascript
const fresh = await api.getIssue('proj-1', 'issue-1');
await api.updateIssue('proj-1', 'issue-1', {
  status: 'In Progress',
  version: fresh.version,  // Use fresh version
});
```

### "Not Found" Error

**Problem**: You're getting a `404 Not Found` response.

**Solution**: Verify the resource ID is correct:

```bash
# Double-check the ID
curl -X GET https://api.hinear.com/api/v1/projects/proj-1 \
  -b cookies.txt
```

---

## Next Steps

- **Full API Documentation**: See [API Endpoints Contract](contracts/api-endpoints.md)
- **Error Reference**: See [Error Response Contract](contracts/error-responses.md)
- **Pagination Guide**: See [Pagination Format Contract](contracts/pagination-format.md)
- **OpenAPI Spec**: Available at `/api/v1/docs` (Swagger UI)

---

## Support

- **Documentation**: https://docs.hinear.com
- **Status Page**: https://status.hinear.com
- **Email Support**: support@hinear.com
- **GitHub Issues**: https://github.com/hinear/hinear/issues

---

**Document Status**: ✅ Final
**Quickstart guide for developers to get started in 15 minutes**
