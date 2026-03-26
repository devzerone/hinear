-- Query Performance Optimization Indexes
-- Migration: 004_query_indexes.sql
-- Feature: 003-performance-audit (User Story 2: Optimization)

-- These indexes optimize the most common queries identified during profiling

-- Index for project list queries (filters by project_id and status)
-- Used in: getIssuesByProjectPage, issue board views
CREATE INDEX IF NOT EXISTS idx_issues_project_status
ON issues(project_id, status)
WHERE status != 'Done';

-- Index for assignee filter queries
-- Used in: listIssuesByAssignee
CREATE INDEX IF NOT EXISTS idx_issues_assignee
ON issues(assignee_id)
WHERE assignee_id IS NOT NULL;

-- Index for chronological ordering
-- Used in: issue list views, activity feeds
CREATE INDEX IF NOT EXISTS idx_issues_created_at_desc
ON issues(created_at DESC);

-- Composite index for project + status + created_at (optimized sorting)
-- Used in: issue board with status filtering
CREATE INDEX IF NOT EXISTS idx_issues_project_status_created
ON issues(project_id, status, created_at DESC)
WHERE status != 'Done';

-- Index for project members queries
-- Used in: listProjectMembers
CREATE INDEX IF NOT EXISTS idx_project_members_project_role
ON project_members(project_id, role);

-- Index for issue comments
-- Used in: getIssueById (comment loading)
CREATE INDEX IF NOT EXISTS idx_comments_issue_created
ON comments(issue_id, created_at DESC);

-- Index for issue labels (many-to-many relationship)
-- Used in: label filtering
CREATE INDEX IF NOT EXISTS idx_issue_labels_issue
ON issue_labels(issue_id);

-- Index for issue labels by label
-- Used in: listIssuesByLabel
CREATE INDEX IF NOT EXISTS idx_issue_labels_label
ON issue_labels(label_id);

-- Partial index for active issues (performance optimization)
-- Only indexes issues that are not done, reducing index size
CREATE INDEX IF NOT EXISTS idx_issues_active_project
ON issues(project_id, created_at DESC)
WHERE status != 'Done';

-- Index for issue updates tracking
-- Used in: updateIssue (optimistic locking version checks)
CREATE INDEX IF NOT EXISTS idx_issues_updated_at
ON issues(updated_at DESC);

-- Index for performance metrics queries
-- Used in: performance dashboard, reports
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_timestamp
ON performance_metrics(name, timestamp DESC);

-- Index for performance bottlenecks by severity
-- Used in: bottleneck tracking dashboard
CREATE INDEX IF NOT EXISTS idx_performance_bottlenecks_severity_status
ON performance_bottlenecks(severity, status)
WHERE status != 'RESOLVED';

-- Analyze tables for query optimization
-- This updates statistics for the query planner
ANALYZE issues;
ANALYZE project_members;
ANALYZE comments;
ANALYZE issue_labels;
ANALYZE performance_metrics;
ANALYZE performance_bottlenecks;

-- Comments for documentation
COMMENT ON INDEX idx_issues_project_status IS 'Optimizes issue board queries with project and status filtering';
COMMENT ON INDEX idx_issues_assignee IS 'Optimizes assignee filter queries';
COMMENT ON INDEX idx_issues_created_at_desc IS 'Optimizes chronological ordering of issues';
COMMENT ON INDEX idx_issues_project_status_created IS 'Composite index for optimized sorting with filters';
COMMENT ON INDEX idx_issues_active_project IS 'Partial index for active issues only, reducing index size';
