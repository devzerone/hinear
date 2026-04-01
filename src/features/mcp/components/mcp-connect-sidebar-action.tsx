"use client";

import { PlugZap, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/atoms/Button";
import { SidebarItem } from "@/components/molecules/SidebarItem";

function buildEndpoint(origin: string | null) {
  return origin ? `${origin}/api/mcp` : "https://YOUR-HINEAR-URL/api/mcp";
}

function buildCodexCommand(endpoint: string) {
  return `codex mcp add hinear --url ${endpoint}`;
}

function buildClaudeCommand(endpoint: string) {
  return `claude mcp add --transport http hinear ${endpoint}`;
}

export function McpConnectSidebarAction() {
  const [isOpen, setIsOpen] = useState(false);
  const [origin, setOrigin] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const endpoint = buildEndpoint(origin);
  const codexCommand = buildCodexCommand(endpoint);
  const claudeCommand = buildClaudeCommand(endpoint);

  async function copyText(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Clipboard access failed.");
    }
  }

  return (
    <>
      <SidebarItem
        className="w-full"
        icon={<PlugZap className="h-4 w-4" />}
        label="Connect MCP"
        onClick={() => setIsOpen(true)}
      />

      {isOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1020]/70 p-4"
          role="dialog"
        >
          <button
            aria-label="Close MCP connect modal"
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <div className="relative w-full max-w-[720px] rounded-[24px] border border-[#E6E8EC] bg-white p-6 shadow-[0_24px_80px_rgba(17,19,24,0.25)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-[12px] leading-[12px] font-[var(--app-font-weight-600)] text-[#5E6AD2]">
                  Connect MCP
                </p>
                <h2 className="font-display text-[28px] leading-[1.1] font-[var(--app-font-weight-700)] text-[#111318]">
                  Connect Hinear to Codex or Claude Code
                </h2>
                <p className="max-w-[560px] text-[14px] leading-6 font-[var(--app-font-weight-500)] text-[#4B5563]">
                  Run one of these commands in your terminal. OAuth login will
                  open in the browser and complete the connection automatically.
                </p>
              </div>

              <button
                aria-label="Close MCP connect modal"
                className="rounded-[12px] p-2 text-[#6B7280] transition-colors hover:bg-[#F5F7FF] hover:text-[#111318]"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 rounded-[16px] border border-[#E6E8EC] bg-[#FCFCFD] p-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-[14px] font-semibold text-[#111318]">
                  MCP endpoint
                </h3>
                <code className="block break-all text-[13px] leading-6 text-[#111318]">
                  {endpoint}
                </code>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <section className="rounded-[20px] border border-[#E6E8EC] bg-[#FCFCFD] p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#111318]">
                      Codex
                    </h3>
                    <p className="mt-1 text-[13px] leading-6 text-[#6B7280]">
                      Run this once. Codex will detect OAuth support and open
                      the browser login flow.
                    </p>
                  </div>

                  <pre className="overflow-x-auto rounded-[14px] border border-[#E6E8EC] bg-white p-3 text-[12px] leading-5 whitespace-pre-wrap break-all text-[#111318]">
                    {codexCommand}
                  </pre>

                  <Button
                    onClick={() =>
                      copyText(codexCommand, "Codex command copied.")
                    }
                    variant="secondary"
                  >
                    Copy Codex command
                  </Button>
                </div>
              </section>

              <section className="rounded-[20px] border border-[#E6E8EC] bg-[#FCFCFD] p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#111318]">
                      Claude Code
                    </h3>
                    <p className="mt-1 text-[13px] leading-6 text-[#6B7280]">
                      Add the remote server, then follow the OAuth prompt in
                      Claude Code.
                    </p>
                  </div>

                  <pre className="overflow-x-auto rounded-[14px] border border-[#E6E8EC] bg-white p-3 text-[12px] leading-5 whitespace-pre-wrap break-all text-[#111318]">
                    {claudeCommand}
                  </pre>

                  <Button
                    onClick={() =>
                      copyText(claudeCommand, "Claude Code command copied.")
                    }
                    variant="secondary"
                  >
                    Copy Claude command
                  </Button>
                </div>
              </section>
            </div>

            <div className="mt-4 rounded-[16px] border border-[#E6E8EC] bg-[#FCFCFD] p-4">
              <p className="text-[13px] leading-6 text-[#4B5563]">
                If the CLI asks for browser authorization, sign in with your
                Hinear account. After login, the MCP server will be connected
                without manually copying a token.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
