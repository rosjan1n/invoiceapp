import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Okno czasowe w ms
  maxRequests: number; // Maksymalna liczba zapytań w oknie
  message: string;
  retryAfter?: number; // Czas w sekundach do ponownej próby
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Prosta implementacja rate limiting w pamięci
// W produkcji użyj Redis lub innej bazy danych
const store: RateLimitStore = {};

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minuta
  maxRequests: 30, // 30 zapytań na minutę
  message: "Too many requests",
  retryAfter: 60, // 60 sekund
};

export function createRateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return (req: NextRequest): NextResponse | null => {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowStart = now - finalConfig.windowMs;

    // Wyczyść stare wpisy
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });

    // Sprawdź czy IP istnieje w store
    if (!store[ip]) {
      store[ip] = {
        count: 1,
        resetTime: now + finalConfig.windowMs,
      };
      return null; // Pozwól na zapytanie
    }

    // Sprawdź czy okno czasowe się skończyło
    if (store[ip].resetTime < now) {
      store[ip] = {
        count: 1,
        resetTime: now + finalConfig.windowMs,
      };
      return null; // Pozwól na zapytanie
    }

    // Sprawdź czy przekroczono limit
    if (store[ip].count >= finalConfig.maxRequests) {
      const retryAfter = Math.ceil((store[ip].resetTime - now) / 1000);

      return new NextResponse(
        JSON.stringify({
          error: finalConfig.message,
          message: `Zbyt wiele zapytań. Spróbuj ponownie za ${retryAfter} sekund.`,
          retryAfter,
          limit: finalConfig.maxRequests,
          remaining: 0,
          resetTime: store[ip].resetTime,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": finalConfig.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": store[ip].resetTime.toString(),
          },
        }
      );
    }

    // Zwiększ licznik
    store[ip].count++;

    // Nie zwracaj odpowiedzi - pozwól na kontynuację
    return null;
  };
}

// Predefiniowane konfiguracje rate limiting
export const rateLimitConfigs = {
  // Dla API faktur - bardziej restrykcyjne
  invoices: {
    windowMs: 60 * 1000, // 1 minuta
    maxRequests: 20, // 20 zapytań na minutę
    message: "Too many requests",
    retryAfter: 60,
  },

  // Dla ogólnych API - mniej restrykcyjne
  general: {
    windowMs: 60 * 1000, // 1 minuta
    maxRequests: 50, // 50 zapytań na minutę
    message: "Too many requests",
    retryAfter: 60,
  },

  // Dla autentykacji - bardzo restrykcyjne
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minut
    maxRequests: 5, // 5 prób na 15 minut
    message: "Too many authentication attempts",
    retryAfter: 15 * 60, // 15 minut
  },

  // Dla uploadów - bardzo restrykcyjne
  upload: {
    windowMs: 60 * 1000, // 1 minuta
    maxRequests: 5, // 5 uploadów na minutę
    message: "Too many upload requests",
    retryAfter: 60,
  },
};

// Hook do sprawdzania rate limit w komponencie
export function useRateLimit() {
  const checkRateLimit = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint, { method: "HEAD" });

      if (response.status === 429) {
        const data = await response.json();
        return {
          isLimited: true,
          retryAfter: data.retryAfter,
          message: data.message,
        };
      }

      return {
        isLimited: false,
        remaining: parseInt(
          response.headers.get("X-RateLimit-Remaining") || "0"
        ),
        limit: parseInt(response.headers.get("X-RateLimit-Limit") || "0"),
      };
    } catch (error) {
      return {
        isLimited: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  return { checkRateLimit };
}
