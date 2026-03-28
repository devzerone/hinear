import type { OffsetPaginationMeta } from "@/app/api/_lib/contracts";
import type {
  Project,
  ProjectInvitation,
  ProjectInvitationSummary,
  ProjectMember,
  ProjectMemberSummary,
  ProjectType,
} from "@/features/projects/types";

export interface CreateProjectInput {
  key: string;
  name: string;
  type: ProjectType;
  createdBy: string;
}

export interface InviteProjectMemberInput {
  projectId: string;
  email: string;
  invitedBy: string;
}

export interface UpdateProjectInput {
  key: string;
  name: string;
  projectId: string;
  type: ProjectType;
}

export interface DeleteProjectInput {
  projectId: string;
  deletedBy: string;
}

export interface ProjectsRepository {
  createProject(input: CreateProjectInput): Promise<Project>;
  addProjectMember(member: ProjectMember): Promise<ProjectMember>;
  inviteProjectMember(
    input: InviteProjectMemberInput
  ): Promise<ProjectInvitation>;
  updateProject(input: UpdateProjectInput): Promise<Project>;
  deleteProject(input: DeleteProjectInput): Promise<void>;
  getProjectById(projectId: string): Promise<Project | null>;
  getProjectByKey(key: string): Promise<Project | null>;
  listProjects(): Promise<Project[]>;
  listProjectMembers(projectId: string): Promise<ProjectMemberSummary[]>;
  listPendingProjectInvitations(
    projectId: string
  ): Promise<ProjectInvitationSummary[]>;
  removeProjectMember(projectId: string, userId: string): Promise<void>;
  resendProjectInvitation(invitationId: string): Promise<ProjectInvitation>;
  revokeProjectInvitation(invitationId: string): Promise<ProjectInvitation>;

  // 누락됨 - 조회
  listUserProjects(userId: string): Promise<Project[]>;
  listProjectsByType(type: ProjectType): Promise<Project[]>;

  // 누락됨 - 접근 제어 (필수)
  checkProjectAccess(projectId: string, userId: string): Promise<boolean>;
  validateProjectKey(key: string): Promise<boolean>;
  projectExists(key: string): Promise<boolean>;
}

export interface GetProjectByKeyInput {
  key: string;
}

export interface ListUserProjectsInput {
  userId: string;
}

export interface ListProjectsByTypeInput {
  type: ProjectType;
}

export interface CheckProjectAccessInput {
  projectId: string;
  userId: string;
}

export interface ValidateProjectKeyInput {
  key: string;
}

export interface ProjectExistsInput {
  key: string;
}

export interface UpdateGitHubIntegrationInput {
  projectId: string;
  enabled: boolean;
  repoOwner?: string;
  repoName?: string;
}

export interface GitHubIntegrationSettings {
  enabled: boolean;
  repoOwner?: string | null;
  repoName?: string | null;
  connected?: boolean;
}

export interface ProjectResource {
  created_at: string;
  id: string;
  key: string;
  name: string;
  type: ProjectType;
  updated_at: string;
}

export interface CreateProjectRequest {
  key: string;
  name: string;
  type: ProjectType;
}

export interface UpdateProjectRequest {
  key?: string;
  name?: string;
  type?: ProjectType;
}

export interface ProjectCollectionQuery {
  limit?: number;
  order?: "asc" | "desc";
  page?: number;
  sort?: "createdAt" | "name" | "updatedAt";
}

export interface ProjectCollectionResponse {
  items: ProjectResource[];
  pagination: OffsetPaginationMeta;
}
