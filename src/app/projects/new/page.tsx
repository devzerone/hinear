import { redirect } from "next/navigation";

import { buildAuthPath } from "@/features/auth/lib/next-path";
import { createProjectAction } from "@/features/projects/actions/create-project-action";
import { ProjectCreateScreen } from "@/features/projects/components/project-create-screen";
import { getAuthenticatedActorIdOrNull } from "@/lib/supabase/server-auth";

export default async function NewProjectPage() {
  if (!(await getAuthenticatedActorIdOrNull())) {
    redirect(buildAuthPath("/projects/new"));
  }

  return <ProjectCreateScreen action={createProjectAction} />;
}
