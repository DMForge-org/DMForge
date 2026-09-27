import { describe, it, expect, vi } from "vitest";
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
} from "../errors";
import { log, logError } from "../logger";
import { withErrorHandling } from "../route-handler";
import { NextResponse } from "next/server";

describe("Domain Errors (lib/errors.js)", () => {
  it("creates standard AppError with defaults", () => {
    const err = new AppError("Internal fail");
    expect(err.message).toBe("Internal fail");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.name).toBe("AppError");
  });

  it("creates NotFoundError with 404", () => {
    const err = new NotFoundError("Agent");
    expect(err.message).toBe("Agent not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.name).toBe("NotFoundError");
  });

  it("creates ValidationError with 400", () => {
    const err = new ValidationError("Invalid email");
    expect(err.message).toBe("Invalid email");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
  });

  it("creates UnauthorizedError and ForbiddenError with 401 and 403", () => {
    const unauth = new UnauthorizedError();
    expect(unauth.statusCode).toBe(401);
    expect(unauth.code).toBe("UNAUTHORIZED");

    const forbidden = new ForbiddenError();
    expect(forbidden.statusCode).toBe(403);
    expect(forbidden.code).toBe("FORBIDDEN");
  });
});

describe("Structured Logger (lib/logger.js)", () => {
  it("formats structured error log without crashing", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("Test failure", new Error("DB connection timeout"), {
      path: "/api/test",
      method: "POST",
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("Route Handler Error Wrapper (lib/route-handler.js)", () => {
  it("returns domain error status and message without crashing", async () => {
    const handler = withErrorHandling(async () => {
      throw new NotFoundError("Subscription");
    });

    const mockRequest = {
      url: "http://localhost:3000/api/billing",
      method: "GET",
    };
    const res = await handler(mockRequest);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Subscription not found");
    expect(json.code).toBe("NOT_FOUND");
  });

  it("masks unhandled internal errors with generic 500", async () => {
    const handler = withErrorHandling(async () => {
      throw new Error("Secret database credentials connection error");
    });

    const mockRequest = {
      url: "http://localhost:3000/api/users",
      method: "POST",
    };
    const res = await handler(mockRequest);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("An unexpected error occurred. Please try again.");
    expect(json.stack).toBeUndefined();
  });

  it("passes through successful responses", async () => {
    const handler = withErrorHandling(async () => {
      return NextResponse.json({ ok: true });
    });

    const mockRequest = {
      url: "http://localhost:3000/api/health",
      method: "GET",
    };
    const res = await handler(mockRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});
