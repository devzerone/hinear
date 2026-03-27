"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateIssueInput,
  DeleteIssueInput,
  UpdateIssueInput,
} from "@/features/issues/contracts";
import { createIssuesRepository } from "@/features/issues/repositories/supabase-issues-repository";
import {
  cacheTimes,
  queryKeys,
  staleTimes,
} from "@/lib/react-query/query-client";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";

/**
 * React Query hooks for issue operations
 * Feature: 003-performance-audit (User Story 2: Optimization)
 *
 * Provides cached and optimized data fetching for issues
 */

export function useIssue(issueId: string) {
  const supabase = createBrowserSupabaseClient();
  const repository = createIssuesRepository(supabase);

  return useQuery({
    queryKey: queryKeys.issues.detail(issueId),
    queryFn: () => repository.getIssueById(issueId),
    staleTime: staleTimes.issue,
    gcTime: cacheTimes.issue,
    enabled: !!issueId,
  });
}

export function useIssueComments(issueId: string) {
  const supabase = createBrowserSupabaseClient();
  const repository = createIssuesRepository(supabase);

  return useQuery({
    queryKey: queryKeys.issues.comments(issueId),
    queryFn: () => repository.listCommentsByIssueId(issueId),
    staleTime: staleTimes.issueComments,
    gcTime: cacheTimes.issueComments,
    enabled: !!issueId,
  });
}

export function useIssueActivity(issueId: string) {
  const supabase = createBrowserSupabaseClient();
  const repository = createIssuesRepository(supabase);

  return useQuery({
    queryKey: queryKeys.issues.activity(issueId),
    queryFn: () => repository.listActivityLogByIssueId(issueId),
    staleTime: staleTimes.issueActivity,
    gcTime: cacheTimes.issueActivity,
    enabled: !!issueId,
  });
}

export function useIssuesByProject(projectId: string) {
  const supabase = createBrowserSupabaseClient();
  const repository = createIssuesRepository(supabase);

  return useQuery({
    queryKey: queryKeys.issues.list(projectId),
    queryFn: () => repository.listIssuesByProject(projectId),
    staleTime: staleTimes.issueList,
    gcTime: cacheTimes.issueList,
    enabled: !!projectId,
  });
}

export function useCreateIssue() {
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();
  const repository = createIssuesRepository(supabase);

  return useMutation({
    mutationFn: (input: CreateIssueInput) => repository.createIssue(input),
    onSuccess: (_data, variables) => {
      // Invalidate the project's issue list
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues.list(variables.projectId),
      });
    },
  });
}

export function useUpdateIssue() {
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();
  const repository = createIssuesRepository(supabase);

  return useMutation({
    mutationFn: ({
      issueId,
      input,
    }: {
      issueId: string;
      input: UpdateIssueInput;
    }) => repository.updateIssue(issueId, input),
    onSuccess: (data, variables) => {
      // Update the specific issue cache
      queryClient.setQueryData(
        queryKeys.issues.detail(variables.issueId),
        data
      );
      // Invalidate the issue list
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues.list(data.projectId),
      });
      // Invalidate activity log
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues.activity(variables.issueId),
      });
    },
  });
}

export function useDeleteIssue() {
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();
  const repository = createIssuesRepository(supabase);

  return useMutation({
    mutationFn: (input: DeleteIssueInput) => repository.deleteIssue(input),
    onSuccess: async (_data, variables) => {
      // Get the issue first to know which project to invalidate
      const issue = await repository.getIssueById(variables.issueId);
      if (issue) {
        // Invalidate the project's issue list
        queryClient.invalidateQueries({
          queryKey: queryKeys.issues.list(issue.projectId),
        });
      }
    },
  });
}

/**
 * Helper function to create repository instances
 */
function _createIssuesRepository(client: any) {
  const {
    SupabaseIssuesRepository,
  } = require("@/features/issues/repositories/supabase-issues-repository");
  return new SupabaseIssuesRepository(client);
}
