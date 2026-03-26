import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { createClient } from "@supabase/supabase-js";
import {
  MCP_ENV_FILE,
  ROOT_ENV_FILE,
  readEnvFile,
  writeEnvFile,
} from "./shared.js";

const rl = readline.createInterface({ input, output });

type LoginOptions = {
  accessToken?: string;
  anonKey?: string;
  appOrigin?: string;
  email?: string;
  serviceRoleKey?: string;
  supabaseUrl?: string;
  userId?: string;
};

async function ask(question: string, fallback?: string) {
  const suffix = fallback ? ` [${fallback}]` : "";
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || fallback || "";
}

function readOption(name: string): string | undefined {
  const flag = `--${name}`;
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1]?.trim() || "";
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function resolveUserIdByEmail({
  anonKey,
  email,
  serviceRoleKey,
  supabaseUrl,
}: {
  anonKey: string;
  email: string;
  serviceRoleKey?: string;
  supabaseUrl: string;
}): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !serviceRoleKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        apikey: anonKey,
      },
    },
  });
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email_normalized", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to resolve HINEAR_MCP_USER_ID from email: ${error.message}`
    );
  }

  return data?.id ?? null;
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    output.write("Usage: pnpm mcp:hinear:login\n");
    output.write(
      "Prompts for Supabase and MCP auth values, then saves them to mcp/hinear/.env.local.\n"
    );
    output.write(
      "Defaults are loaded from mcp/hinear/.env.local and the repository root .env.local when available.\n"
    );
    output.write(
      "Optional flags: --email <email> --user-id <id> --access-token <token> --app-origin <url>\n"
    );
    return;
  }

  const existing = new Map<string, string>([
    ...readEnvFile(ROOT_ENV_FILE),
    ...readEnvFile(MCP_ENV_FILE),
  ]);
  const options: LoginOptions = {
    accessToken: readOption("access-token"),
    anonKey: readOption("anon-key"),
    appOrigin: readOption("app-origin"),
    email: readOption("email"),
    serviceRoleKey: readOption("service-role-key"),
    supabaseUrl: readOption("supabase-url"),
    userId: readOption("user-id"),
  };
  const nonInteractive = hasFlag("non-interactive");

  const nextPublicSupabaseUrl =
    options.supabaseUrl ||
    (nonInteractive
      ? existing.get("NEXT_PUBLIC_SUPABASE_URL") ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        ""
      : await ask(
          "NEXT_PUBLIC_SUPABASE_URL",
          existing.get("NEXT_PUBLIC_SUPABASE_URL") ||
            process.env.NEXT_PUBLIC_SUPABASE_URL ||
            ""
        ));
  const nextPublicSupabaseAnonKey =
    options.anonKey ||
    (nonInteractive
      ? existing.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        ""
      : await ask(
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          existing.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
            ""
        ));
  const supabaseServiceRoleKey =
    options.serviceRoleKey ||
    (nonInteractive
      ? existing.get("SUPABASE_SERVICE_ROLE_KEY") ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        ""
      : await ask(
          "SUPABASE_SERVICE_ROLE_KEY",
          existing.get("SUPABASE_SERVICE_ROLE_KEY") ||
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            ""
        ));
  const hinearMcpAccessToken =
    options.accessToken ||
    (nonInteractive
      ? existing.get("HINEAR_MCP_ACCESS_TOKEN") ||
        process.env.HINEAR_MCP_ACCESS_TOKEN ||
        ""
      : await ask(
          "HINEAR_MCP_ACCESS_TOKEN",
          existing.get("HINEAR_MCP_ACCESS_TOKEN") ||
            process.env.HINEAR_MCP_ACCESS_TOKEN ||
            ""
        ));

  let hinearMcpUserId =
    options.userId ||
    existing.get("HINEAR_MCP_USER_ID") ||
    process.env.HINEAR_MCP_USER_ID ||
    "";

  if (!hinearMcpUserId && options.email) {
    hinearMcpUserId =
      (await resolveUserIdByEmail({
        anonKey: nextPublicSupabaseAnonKey,
        email: options.email,
        serviceRoleKey: supabaseServiceRoleKey || undefined,
        supabaseUrl: nextPublicSupabaseUrl,
      })) ?? "";
  }

  if (!hinearMcpUserId && !nonInteractive) {
    hinearMcpUserId = await ask("HINEAR_MCP_USER_ID", hinearMcpUserId);
  }

  const appOrigin =
    options.appOrigin ||
    (nonInteractive
      ? existing.get("APP_ORIGIN") ||
        process.env.APP_ORIGIN ||
        "http://localhost:3000"
      : await ask(
          "APP_ORIGIN",
          existing.get("APP_ORIGIN") ||
            process.env.APP_ORIGIN ||
            "http://localhost:3000"
        ));

  if (!nextPublicSupabaseUrl || !nextPublicSupabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required."
    );
  }

  if (options.email && !hinearMcpUserId && !hinearMcpAccessToken) {
    throw new Error(
      "Could not resolve HINEAR_MCP_USER_ID from the provided email. Make sure the profile exists and SUPABASE_SERVICE_ROLE_KEY is available."
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
  if (options.email && hinearMcpUserId) {
    output.write(`Resolved ${options.email} to HINEAR_MCP_USER_ID.\n`);
  }
  output.write("Run `pnpm mcp:hinear:smoke` to verify the local MCP server.\n");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await rl.close();
  });
