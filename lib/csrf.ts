import { NextRequest, NextResponse } from "next/server";
import { validateCSRFToken, generateCSRFTokenWithSecret } from "./security";

const CSRF_SECRET =
  process.env.CSRF_SECRET || "default-csrf-secret-change-in-production";

export function generateCSRFToken(): string {
  return generateCSRFTokenWithSecret(CSRF_SECRET);
}

export function validateCSRFTokenFromRequest(request: NextRequest): boolean {
  const token =
    request.headers.get("x-csrf-token") ||
    request.cookies.get("csrf-token")?.value;

  if (!token) return false;

  return validateCSRFToken(token, CSRF_SECRET);
}

export function addCSRFProtection(response: NextResponse): NextResponse {
  const token = generateCSRFToken();

  // Dodaj token do cookies
  response.cookies.set("csrf-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 godziny
  });

  // Dodaj token do headers
  response.headers.set("x-csrf-token", token);

  return response;
}

export function createCSRFMiddleware() {
  return (request: NextRequest) => {
    // Sprawdź tylko dla metod które modyfikują dane
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      // Pomiń walidację CSRF dla niektórych endpointów
      const skipCSRF = ["/api/auth/", "/api/webhooks/", "/api/upload/"];

      const shouldSkip = skipCSRF.some((path) =>
        request.nextUrl.pathname.startsWith(path)
      );

      if (!shouldSkip && !validateCSRFTokenFromRequest(request)) {
        return new NextResponse(
          JSON.stringify({ error: "Invalid CSRF token" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    return NextResponse.next();
  };
}
