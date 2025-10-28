import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function addRateLimitHeaders(req: NextRequest, response: NextResponse) {
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuta
  const maxRequests = 20; // 20 zapytań na minutę

  // Wyczyść stare wpisy
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });

  // Inicjalizuj lub zresetuj licznik
  if (!store[ip] || store[ip].resetTime < now) {
    store[ip] = {
      count: 1,
      resetTime: now + windowMs,
    };
  } else {
    store[ip].count++;
  }

  // Dodaj nagłówki rate limit
  const remaining = Math.max(0, maxRequests - store[ip].count);

  response.headers.set("X-RateLimit-Limit", maxRequests.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", store[ip].resetTime.toString());

  return response;
}
