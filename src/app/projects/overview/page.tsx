import { redirect } from "next/navigation";

import { getResolvedProjectOverviewPath } from "@/features/auth/lib/default-post-auth-path";

export default async function ProjectsOverviewPage() {
  redirect(await getResolvedProjectOverviewPath());
}
