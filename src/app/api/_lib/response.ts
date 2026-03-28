import {
  API_V1_VERSION,
  type ApiErrorEnvelope,
  type ApiMeta,
  type ApiSuccessEnvelope,
} from "@/app/api/_lib/contracts";
import { toApiRouteError } from "@/app/api/_lib/errors";

export function apiSuccess<T extends Record<string, unknown>>(
  payload: T,
  status = 200
) {
  return Response.json(
    {
      success: true,
      ...payload,
    },
    {
      status,
    }
  );
}

export function apiError(
  error: string,
  status: number,
  extra: Record<string, unknown> = {}
) {
  return Response.json(
    {
      success: false,
      error,
      ...extra,
    },
    {
      status,
    }
  );
}

export function apiUnauthorized() {
  return apiError("Unauthorized", 401);
}

export function apiForbidden() {
  return apiError("Forbidden", 403);
}

export function apiInvalidJson() {
  return apiError("Invalid JSON payload", 400);
}

function buildMeta(meta?: Partial<ApiMeta>): ApiMeta {
  return {
    version: API_V1_VERSION,
    ...meta,
  };
}

export function apiV1Success<T>(
  data: T,
  init?: {
    headers?: HeadersInit;
    meta?: Partial<ApiMeta>;
    status?: number;
  }
) {
  const body: ApiSuccessEnvelope<T> = {
    success: true,
    data,
    meta: buildMeta(init?.meta),
  };

  return Response.json(body, {
    headers: {
      "X-API-Version": API_V1_VERSION,
      ...(init?.headers ?? {}),
    },
    status: init?.status ?? 200,
  });
}

export function apiV1Created<T>(data: T, location: string) {
  return apiV1Success(data, {
    headers: {
      Location: location,
    },
    status: 201,
  });
}

export function apiNoContent(headers?: HeadersInit) {
  return new Response(null, {
    headers: {
      "X-API-Version": API_V1_VERSION,
      ...(headers ?? {}),
    },
    status: 204,
  });
}

export function apiV1Error(error: unknown, requestId?: string) {
  const normalized = toApiRouteError(error);
  const body: ApiErrorEnvelope = {
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  return Response.json(body, {
    headers: {
      "X-API-Version": API_V1_VERSION,
    },
    status: normalized.status,
  });
}
