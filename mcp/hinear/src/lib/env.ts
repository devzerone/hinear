export type HinearMcpEnv = {
  accessToken: string | null;
  appOrigin: string | null;
  githubToken: string | null;
  supabaseAnonKey: string | null;
  supabaseServiceRoleKey: string | null;
  supabaseUrl: string | null;
};

export function readEnv(): HinearMcpEnv {
  return {
    accessToken:
      process.env.HINEAR_MCP_ACCESS_TOKEN?.trim() ||
      process.env.SUPABASE_ACCESS_TOKEN?.trim() ||
      null,
    appOrigin:
      process.env.APP_ORIGIN?.trim() ||
      process.env.NEXT_PUBLIC_APP_ORIGIN?.trim() ||
      null,
    githubToken: process.env.GITHUB_TOKEN?.trim() || null,
    supabaseAnonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      process.env.SUPABASE_ANON_KEY?.trim() ||
      null,
    supabaseServiceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null,
    supabaseUrl:
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
      process.env.SUPABASE_URL?.trim() ||
      null,
  };
}
