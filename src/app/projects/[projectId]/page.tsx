import { ProjectWorkspaceScreen } from "@/features/projects/components/project-workspace-screen";
import type { Project } from "@/features/projects/types";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

// MSW 모킹 중이므로 mock 프로젝트 데이터 사용
function getMockProject(projectId: string): Project | null {
  // projectId 형식: "test-project" 또는 실제 프로젝트 ID
  if (projectId === "test-project" || projectId.startsWith("proj-")) {
    return {
      id: projectId,
      key: "WEB",
      name: "Web App",
      type: "personal",
      issueSeq: 5,
      createdBy: "user-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return null;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = getMockProject(projectId);

  if (!project) {
    // MSW 모킹 중이므로 기본 프로젝트 반환
    const defaultProject: Project = {
      id: projectId,
      key: "WEB",
      name: "Test Project",
      type: "personal",
      issueSeq: 0,
      createdBy: "user-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return (
      <ProjectWorkspaceScreen
        action={async () => {}}
        project={defaultProject}
      />
    );
  }

  return <ProjectWorkspaceScreen action={async () => {}} project={project} />;
}
