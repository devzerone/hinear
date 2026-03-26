export class McpNotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} is not implemented yet.`);
    this.name = "McpNotImplementedError";
  }
}

export function notImplemented(feature: string): never {
  throw new McpNotImplementedError(feature);
}
