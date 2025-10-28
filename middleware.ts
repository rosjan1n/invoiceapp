import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { createCSRFMiddleware, addCSRFProtection } from "./lib/csrf";
import { checkRateLimit } from "./lib/security";

export default withAuth(
  function middleware(req) {
    // Dodatkowe sprawdzenia bezpieczeństwa
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Sprawdź czy użytkownik ma ważną sesję
    if (!token && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Rate limiting
    const clientIP = req.ip || req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIP, 100, 15 * 60 * 1000)) {
      // Przekieruj do custom error page zamiast zwracać surowy JSON
      const errorUrl = new URL("/error", req.url);
      errorUrl.searchParams.set("error", "Too many requests");
      errorUrl.searchParams.set("type", "rate_limit");
      errorUrl.searchParams.set("retryAfter", "60");
      return NextResponse.redirect(errorUrl);
    }

    // CSRF Protection
    const csrfMiddleware = createCSRFMiddleware();
    const csrfResponse = csrfMiddleware(req);
    if (csrfResponse) {
      return csrfResponse;
    }

    // Dodaj nagłówki bezpieczeństwa
    const response = NextResponse.next();

    // Security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );

    // Ulepszony CSP header
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://www.gstatic.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' data: https: blob:; " +
        "font-src 'self' data: https://fonts.gstatic.com; " +
        "connect-src 'self' https://accounts.google.com https://api.resend.com; " +
        "frame-src 'self' https://accounts.google.com; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none';"
    );

    // Dodaj CSRF token do odpowiedzi
    return addCSRFProtection(response);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Debug logi dla produkcji
        if (process.env.NODE_ENV === "production") {
          console.log(`Middleware: ${pathname}, token: ${!!token}`);
        }

        // Publiczne ścieżki
        if (
          pathname.startsWith("/sign-in") ||
          pathname.startsWith("/sign-up") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon.ico") ||
          pathname.startsWith("/confirm-invoice") ||
          pathname === "/"
        ) {
          return true;
        }

        // Wymagaj autoryzacji dla wszystkich innych ścieżek
        const isAuthorized = !!token;

        if (!isAuthorized && process.env.NODE_ENV === "production") {
          console.log(`Unauthorized access to: ${pathname}`);
        }

        return isAuthorized;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
