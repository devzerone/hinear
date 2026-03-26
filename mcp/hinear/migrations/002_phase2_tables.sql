-- MCP Phase 2/3 Migration: Labels, Invitations, GitHub Integrations, MCP Access Tokens
-- Date: 2026-03-26
-- Description: Add tables for label management, member invitations, GitHub integration, and MCP token authentication

-- Labels table
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, LOWER(name))
);

CREATE INDEX IF NOT EXISTS idx_labels_project_id ON labels(project_id);

-- Issue-labels join table (if not exists)
CREATE TABLE IF NOT EXISTS issue_labels (
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_id, label_id)
);

-- Invitations table (if not exists)
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, email, status) FILTER (WHERE status = 'pending')
);

CREATE INDEX IF NOT EXISTS idx_invitations_project_id ON invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- GitHub integrations table
CREATE TABLE IF NOT EXISTS github_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  github_issue_id INTEGER,
  github_pr_number INTEGER,
  github_repo_full_name TEXT,
  branch_name TEXT,
  auto_merge BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (issue_id, github_issue_id) FILTER (WHERE github_issue_id IS NOT NULL),
  UNIQUE (issue_id, github_pr_number) FILTER (WHERE github_pr_number IS NOT NULL),
  CHECK (
    (github_issue_id IS NOT NULL) OR
    (github_pr_number IS NOT NULL) OR
    (branch_name IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_github_integrations_project_id ON github_integrations(project_id);
CREATE INDEX IF NOT EXISTS idx_github_integrations_issue_id ON github_integrations(issue_id);
CREATE INDEX IF NOT EXISTS idx_github_integrations_pr_number ON github_integrations(github_pr_number) FILTER (WHERE github_pr_number IS NOT NULL);

-- MCP access tokens table
CREATE TABLE IF NOT EXISTS mcp_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mcp_access_tokens_user_id ON mcp_access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_access_tokens_token_hash ON mcp_access_tokens(token_hash);

-- RLS for MCP tokens
ALTER TABLE mcp_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own active MCP tokens"
  ON mcp_access_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MCP tokens"
  ON mcp_access_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can revoke own MCP tokens"
  ON mcp_access_tokens FOR UPDATE
  USING (auth.uid() = user_id);
