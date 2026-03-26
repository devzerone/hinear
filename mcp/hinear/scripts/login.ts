import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { MCP_ENV_FILE, readEnvFile, writeEnvFile } from "./shared.js";

const rl = readline.createInterface({ input, output });

async function ask(question: string, fallback?: string) {
  const suffix = fallback ? ` [${fallback}]` : "";
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || fallback || "";
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    output.write("Usage: pnpm mcp:hinear:login\n");
    output.write(
      "Prompts for Supabase and MCP auth values, then saves them to mcp/hinear/.env.local.\n"
    );
    return;
  }

  const existing = readEnvFile(MCP_ENV_FILE);

  const nextPublicSupabaseUrl = await ask(
    "NEXT_PUBLIC_SUPABASE_URL",
    existing.get("NEXT_PUBLIC_SUPABASE_URL") ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      ""
  );
  const nextPublicSupabaseAnonKey = await ask(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    existing.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ""
  );
  const supabaseServiceRoleKey = await ask(
    "SUPABASE_SERVICE_ROLE_KEY",
    existing.get("SUPABASE_SERVICE_ROLE_KEY") ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      ""
  );
  const hinearMcpAccessToken = await ask(
    "HINEAR_MCP_ACCESS_TOKEN",
    existing.get("HINEAR_MCP_ACCESS_TOKEN") ||
      process.env.HINEAR_MCP_ACCESS_TOKEN ||
      ""
  );
  const hinearMcpUserId = await ask(
    "HINEAR_MCP_USER_ID",
    existing.get("HINEAR_MCP_USER_ID") || process.env.HINEAR_MCP_USER_ID || ""
  );
  const appOrigin = await ask(
    "APP_ORIGIN",
    existing.get("APP_ORIGIN") ||
      process.env.APP_ORIGIN ||
      "http://localhost:3000"
  );

  if (!nextPublicSupabaseUrl || !nextPublicSupabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required."
    );
  }

  if (!hinearMcpAccessToken && !hinearMcpUserId) {
    throw new Error(
      "Set either HINEAR_MCP_ACCESS_TOKEN or HINEAR_MCP_USER_ID."
    );
  }

  const env = new Map<string, string>();
  env.set("NEXT_PUBLIC_SUPABASE_URL", nextPublicSupabaseUrl);
  env.set("NEXT_PUBLIC_SUPABASE_ANON_KEY", nextPublicSupabaseAnonKey);
  if (supabaseServiceRoleKey) {
    env.set("SUPABASE_SERVICE_ROLE_KEY", supabaseServiceRoleKey);
  }
  if (hinearMcpAccessToken) {
    env.set("HINEAR_MCP_ACCESS_TOKEN", hinearMcpAccessToken);
  }
  if (hinearMcpUserId) {
    env.set("HINEAR_MCP_USER_ID", hinearMcpUserId);
  }
  if (appOrigin) {
    env.set("APP_ORIGIN", appOrigin);
  }

  writeEnvFile(MCP_ENV_FILE, env);
  output.write(`\nSaved MCP login config to ${MCP_ENV_FILE}\n`);
  output.write("Run `pnpm mcp:hinear` to start the local MCP server.\n");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await rl.close();
  });
