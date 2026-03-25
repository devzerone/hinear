import { ProjectOverviewScreen } from "@/features/projects/components/project-overview-screen";
import { loadProjectWorkspace } from "@/features/projects/lib/load-project-workspace";

interface ProjectOverviewPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectOverviewPage({
  params,
}: ProjectOverviewPageProps) {
  const { projectId } = await params;
  const { accessibleProjects, issues, project, summary } =
    await loadProjectWorkspace(projectId, `/projects/${projectId}/overview`);

  return (
    <ProjectOverviewScreen
      issues={issues}
      project={project}
      projects={accessibleProjects}
      summary={summary}
    />
  );
}
