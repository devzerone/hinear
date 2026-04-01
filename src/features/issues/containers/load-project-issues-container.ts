import "server-only";

import type { AppSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Json } from "@/lib/supabase/types";
import type { Assignee, BoardIssue } from "../contracts";
import type { Label } from "../types";

export interface ProjectIssuesData {
  issues: BoardIssue[];
  total: number;
}

export interface LoadProjectIssuesResult {
  data: ProjectIssuesData | null;
  error: Error | null;
}

interface ProjectBoardIssueRow {
  assignee: Json | null;
  created_at: string;
  due_date: string | null;
  id: string;
  identifier: string;
  issue_number: number;
  labels: Json;
  priority: string;
  project_id: string;
  status: string;
  title: string;
  updated_at: string;
}

export async function loadProjectIssuesContainer(
  supabase: AppSupabaseServerClient,
  projectId: string
): Promise<LoadProjectIssuesResult> {
  try {
    const { data, error } = await supabase.rpc("get_project_board_issues", {
      p_project_id: projectId,
    });

    if (error) {
      throw new Error(`Failed to load issues: ${error.message}`);
    }

    const issues = ((data ?? []) as ProjectBoardIssueRow[]).map(mapBoardIssue);

    return {
      data: {
        issues,
        total: issues.length,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Failed to load project issues"),
    };
  }
}

function mapBoardIssue(row: ProjectBoardIssueRow): BoardIssue {
  return {
    id: row.id,
    identifier: row.identifier,
    title: row.title,
    status: row.status as BoardIssue["status"],
    priority: row.priority as BoardIssue["priority"],
    assignee: parseAssignee(row.assignee),
    labels: parseLabels(row.labels),
    issueNumber: row.issue_number,
    projectId: row.project_id,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseAssignee(value: Json | null): Assignee | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const id = value.id;
  const name = value.name;
  const avatarUrl = value.avatarUrl;

  if (typeof id !== "string" || typeof name !== "string") {
    return null;
  }

  return {
    id,
    name,
    avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
  };
}

function parseLabels(value: Json): Label[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }

    const id = item.id;
    const name = item.name;
    const color = item.color;

    if (
      typeof id !== "string" ||
      typeof name !== "string" ||
      typeof color !== "string"
    ) {
      return [];
    }

    return [{ id, name, color }];
  });
}
