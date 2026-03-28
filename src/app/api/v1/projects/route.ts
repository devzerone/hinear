import { requireApiActorId } from "@/app/api/_lib/auth";
import { validationError } from "@/app/api/_lib/errors";
import { buildOffsetPaginationMeta } from "@/app/api/_lib/pagination";
import {
  apiV1Created,
  apiV1Error,
  apiV1Success,
} from "@/app/api/_lib/response";
import {
  parseEnumValue,
  parseJsonBody,
  parsePositiveInt,
  requireNonEmptyString,
} from "@/app/api/_lib/validation";
import { assertProjectKey } from "@/features/projects/lib/project-key";
import {
  buildOrderBy,
  buildProjectQuery,
  validateProjectFilters,
} from "@/features/projects/lib/project-query-builder";
import { getServerProjectsRepository } from "@/features/projects/repositories/server-projects-repository";
import { PROJECT_TYPES } from "@/features/projects/types";

function toProjectResource(
  project: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof getServerProjectsRepository>>["getProjectById"]
    >
  >
) {
  if (!project) {
    return project;
  }

  return {
    created_at: project.createdAt,
    id: project.id,
    key: project.key,
    name: project.name,
    type: project.type,
    updated_at: project.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const actorId = await requireApiActorId();
    const repository = await getServerProjectsRepository();
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), "page", 1);
    const limit = parsePositiveInt(searchParams.get("limit"), "limit", 20, 100);
    const sort = parseEnumValue(
      searchParams.get("sort"),
      ["createdAt", "updatedAt", "name"] as const,
      "sort"
    );
    const order = parseEnumValue(
      searchParams.get("order"),
      ["asc", "desc"] as const,
      "order"
    );
    const offset = (page - 1) * limit;

    const filters = {
      createdBy: actorId,
      limit,
      offset,
    };
    const errors = validateProjectFilters(filters);

    if (errors.length > 0) {
      throw validationError("Project query validation failed", {
        fields: errors,
      });
    }

    buildProjectQuery(filters);
    const orderBy = buildOrderBy({ field: sort, order });
    const projects = await repository.listUserProjects(actorId);
    const sorted = [...projects].sort((left, right) => {
      const leftValue =
        orderBy.column === "name"
          ? left.name
          : orderBy.column === "updated_at"
            ? left.updatedAt
            : left.createdAt;
      const rightValue =
        orderBy.column === "name"
          ? right.name
          : orderBy.column === "updated_at"
            ? right.updatedAt
            : right.createdAt;

      if (leftValue < rightValue) {
        return orderBy.ascending ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return orderBy.ascending ? 1 : -1;
      }

      return 0;
    });
    const items = sorted.slice(offset, offset + limit).map(toProjectResource);

    return apiV1Success({
      items,
      pagination: buildOffsetPaginationMeta(page, limit, sorted.length),
    });
  } catch (error) {
    return apiV1Error(error);
  }
}

export async function POST(request: Request) {
  try {
    const actorId = await requireApiActorId();
    const payload = await parseJsonBody<{
      key?: string;
      name?: string;
      type?: string;
    }>(request);
    const repository = await getServerProjectsRepository();
    const name = requireNonEmptyString(payload.name, "name");
    const key = assertProjectKey(requireNonEmptyString(payload.key, "key"));
    const type = parseEnumValue(payload.type ?? null, PROJECT_TYPES, "type");

    if (!type) {
      throw validationError("type is required", { field: "type" });
    }

    const project = await repository.createProject({
      createdBy: actorId,
      key,
      name,
      type,
    });

    return apiV1Created(
      toProjectResource(project),
      `/api/v1/projects/${project.id}`
    );
  } catch (error) {
    return apiV1Error(error);
  }
}
