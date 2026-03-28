import type {
  CursorPaginationMeta,
  OffsetPaginationMeta,
} from "@/app/api/_lib/contracts";
import { validationError } from "@/app/api/_lib/errors";

export function buildOffsetPaginationMeta(
  page: number,
  limit: number,
  total: number
): OffsetPaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    hasNext: page < totalPages,
    hasPrev: page > 1,
    limit,
    page,
    total,
    totalPages,
  };
}

export function encodeCursor(payload: { createdAt: string; id: string }) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeCursor(cursor: string) {
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8")
    ) as { createdAt?: string; id?: string };

    if (!decoded.createdAt || !decoded.id) {
      throw new Error("Invalid cursor payload");
    }

    return {
      createdAt: decoded.createdAt,
      id: decoded.id,
    };
  } catch {
    throw validationError("cursor is invalid", { field: "cursor" });
  }
}

export function buildCursorPaginationMeta<
  T extends { createdAt: string; id: string },
>(items: T[], limit: number, hasMore: boolean): CursorPaginationMeta {
  const last = items.at(-1);

  return {
    hasMore,
    limit,
    nextCursor:
      hasMore && last
        ? encodeCursor({ createdAt: last.createdAt, id: last.id })
        : null,
  };
}
