import { CreateProjectSection } from "@/components/organisms/CreateProjectSection";
import type { ProjectType } from "@/features/projects/types";

interface ProjectCreateScreenProps {
  action: (formData: FormData) => void | Promise<void>;
  defaultType?: ProjectType;
}

export function ProjectCreateScreen({
  action,
  defaultType = "personal",
}: ProjectCreateScreenProps) {
  return (
    <main className="app-shell">
      <div className="app-stack">
        <section className="app-panel">
          <p className="app-kicker">Project-first issue tracking</p>
          <h1 className="app-title">Create a project</h1>
          <p className="app-muted">
            Start with a project boundary first, then open the first issue in a
            full-page detail flow.
          </p>
        </section>

        <section className="app-panel">
          <CreateProjectSection action={action} defaultType={defaultType} />
        </section>
      </div>
    </main>
  );
}
