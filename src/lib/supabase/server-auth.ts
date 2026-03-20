import "server-only";

import { createRequestSupabaseServerClient } from "@/lib/supabase/server-client";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "AuthenticationRequiredError";
  }
}

export async function getAuthenticatedActorIdOrNull(): Promise<string | null> {
  const supabase = await createRequestSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export async function requireAuthenticatedActorId(): Promise<string> {
  const actorId = await getAuthenticatedActorIdOrNull();

  if (!actorId) {
    throw new AuthenticationRequiredError();
  }

  return actorId;
}
