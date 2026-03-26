const MCP_TO_HINEAR_STATUS = {
  triage: "Triage",
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
} as const;

const HINEAR_TO_MCP_STATUS = {
  Triage: "triage",
  Backlog: "backlog",
  Todo: "todo",
  "In Progress": "in_progress",
  Done: "done",
  Canceled: "canceled",
  Closed: "canceled",
} as const;

const MCP_TO_HINEAR_PRIORITY = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
} as const;

const HINEAR_TO_MCP_PRIORITY = {
  "No Priority": "medium",
  Low: "low",
  Medium: "medium",
  High: "high",
  Urgent: "urgent",
} as const;

export function mapMcpStatusToHinearStatus(
  value: keyof typeof MCP_TO_HINEAR_STATUS
) {
  return MCP_TO_HINEAR_STATUS[value];
}

export function mapHinearStatusToMcpStatus(value: string) {
  return (
    HINEAR_TO_MCP_STATUS[value as keyof typeof HINEAR_TO_MCP_STATUS] ?? value
  );
}

export function mapMcpPriorityToHinearPriority(
  value: keyof typeof MCP_TO_HINEAR_PRIORITY
) {
  return MCP_TO_HINEAR_PRIORITY[value];
}

export function mapHinearPriorityToMcpPriority(value: string) {
  return (
    HINEAR_TO_MCP_PRIORITY[value as keyof typeof HINEAR_TO_MCP_PRIORITY] ??
    value
  );
}
