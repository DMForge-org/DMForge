// lib/route-handler.js
import { NextResponse } from "next/server";
import { logError } from "./logger";
import { AppError } from "./errors";

export function withErrorHandling(handler) {
  return async (request, context) => {
    const start = Date.now();
    try {
      return await handler(request, context);
    } catch (error) {
      logError("Unhandled route error", error, {
        path: request.nextUrl?.pathname || request.url,
        method: request.method,
        durationMs: Date.now() - start,
      });
      
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }
      
      return NextResponse.json(
        { error: "An unexpected error occurred. Please try again." },
        { status: 500 }
      );
    }
  };
}

