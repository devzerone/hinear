import { describe, expect, it } from "vitest";
import { forbidden, invalidJson, validationError } from "@/app/api/_lib/errors";
import { apiV1Error } from "@/app/api/_lib/response";

describe("REST error response contract", () => {
  it("returns consistent validation payloads", async () => {
    const response = apiV1Error(
      validationError("Invalid request", {
        field: "name",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: {
          field: "name",
        },
      },
    });
  });

  it("returns invalid json payloads", async () => {
    const response = apiV1Error(invalidJson());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_JSON");
  });

  it("returns forbidden payloads", async () => {
    const response = apiV1Error(forbidden());
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
    expect(body.error.timestamp).toBeTypeOf("string");
  });
});
