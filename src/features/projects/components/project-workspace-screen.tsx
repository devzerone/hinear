import Link from "next/link";

import { ProjectOperationsSection } from "@/components/organisms/ProjectOperationsSection";
import { KanbanBoardView } from "@/features/issues/components/KanbanBoardView";
import { ProjectIssueCreatePanel } from "@/features/projects/components/project-issue-create-panel";
import type { Project } from "@/features/projects/types";

interface ProjectWorkspaceScreenProps {
  action: (formData: FormData) => void | Promise<void>;
  project: Project;
}

export function ProjectWorkspaceScreen({
  action,
  project,
}: ProjectWorkspaceScreenProps) {
  return (
    <main className="app-shell">
      <div className="app-stack">
        <section className="app-panel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="app-kicker">{project.key}</p>
              <h1 className="app-title">{project.name}</h1>
              <p className="app-muted">
                Create a new triage issue for {project.key}.
              </p>
            </div>
            <Link href="/" className="app-link !mt-0">
              Back to home
            </Link>
          </div>
        </section>

        <section className="app-grid app-grid-two">
          <section className="app-panel" id="new-issue-form">
            <ProjectIssueCreatePanel action={action} projectKey={project.key} />
          </section>

          <aside className="app-panel">
            <h2 className="app-section-title">Project summary</h2>
            <dl className="app-meta-list">
              <div>
                <dt>Type</dt>
                <dd>{project.type}</dd>
              </div>
              <div>
                <dt>Next issue number</dt>
                <dd>{project.issueSeq + 1}</dd>
              </div>
              <div>
                <dt>Created by</dt>
                <dd>{project.createdBy}</dd>
              </div>
            </dl>
            <p className="app-muted">
              The board stays primary, but project operations remain visible in
              the same flow.
            </p>
          </aside>
        </section>

        <section className="app-panel">
          <KanbanBoardView
            projectId={project.id}
            projectKey={project.key}
            projectName={project.name}
          />
        </section>

        {project.type === "team" && (
          <ProjectOperationsSection
            acceptHref={`/projects/${project.id}`}
            projectName={project.name}
            projectType={project.type}
          />
        )}
      </div>
    </main>
  );
}
