export const API_V1_VERSION = "1.0";

export interface ApiMeta {
  requestId?: string;
  timestamp?: string;
  version: string;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
  timestamp: string;
}

export interface ApiErrorEnvelope {
  success: false;
  error: ApiErrorPayload;
}

export interface OffsetPaginationMeta {
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface CursorPaginationMeta {
  hasMore: boolean;
  limit: number;
  nextCursor: string | null;
}
