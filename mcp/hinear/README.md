# Hinear MCP

`@hinear/mcp` is the local `stdio` MCP server for Hinear.

## Purpose

This package exposes a small, focused MCP surface for Hinear workflows such as:

- listing accessible projects
- searching issues
- reading issue detail
- creating issues
- updating issue status
- adding comments

The first version is intentionally local-first and reuses Hinear domain logic rather than reimplementing business rules inside MCP handlers.

## Commands

```bash
pnpm install
pnpm mcp:hinear:login
pnpm mcp:hinear
pnpm mcp:hinear:typecheck
```

## Required environment

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HINEAR_MCP_ACCESS_TOKEN` or `HINEAR_MCP_USER_ID`

`HINEAR_MCP_ACCESS_TOKEN` is recommended because it lets the MCP resolve the current user from Supabase and apply project access checks with the same user context.

## Login helper

Instead of exporting every variable in your shell, use:

```bash
pnpm mcp:hinear:login
```

This command prompts for the required values and saves them to:

`mcp/hinear/.env.local`

After that, `pnpm mcp:hinear` automatically loads that file before starting the MCP server.

## Local MCP config

The repository-level [.mcp.json](/home/choiho/zerone/hinear/.mcp.json) includes a ready-to-use local server entry:

```json
{
  "mcpServers": {
    "hinear": {
      "type": "stdio",
      "command": "pnpm",
      "args": ["--dir", "/home/choiho/zerone/hinear", "mcp:hinear"]
    }
  }
}
```

The local launcher script loads `mcp/hinear/.env.local`, so the MCP client does not need to forward those env vars directly.

## Implemented tools

- `hinear_mcp_status`
- `list_projects`
- `search_issues`
- `get_issue_detail`
- `create_issue`
- `update_issue_status`
- `add_comment`

## Current status

The Hinear MCP MVP is wired and typechecked. The core six tools are connected to real Hinear data paths.

The next recommended steps are:

- add an MCP smoke test workflow
- exercise the server through a real MCP client
- add second-wave tools such as labels and batch issue updates
