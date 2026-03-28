export function createRouteContext<T extends Record<string, string>>(
  params: T
) {
  return {
    params: Promise.resolve(params),
  };
}

export async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}
