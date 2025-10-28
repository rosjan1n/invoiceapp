import { randomBytes, createHmac } from "crypto";

// CSRF Protection
export function generateCSRFToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateCSRFTokenWithSecret(secret: string): string {
  const token = randomBytes(32).toString("hex");
  const hmac = createHmac("sha256", secret);
  hmac.update(token);
  return `${token}.${hmac.digest("hex")}`;
}

export function validateCSRFToken(token: string, secret: string): boolean {
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [tokenPart, signature] = parts;
  const hmac = createHmac("sha256", secret);
  hmac.update(tokenPart);
  const expectedSignature = hmac.digest("hex");

  return signature === expectedSignature;
}

// Rate Limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minut
): boolean {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitMap.get(key);

  if (!current) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

// Input Sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Usuń potencjalne tagi HTML
    .replace(/javascript:/gi, "") // Usuń potencjalne skrypty
    .replace(/on\w+=/gi, ""); // Usuń potencjalne event handlery
}

// Password Strength Validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Hasło musi mieć co najmniej 8 znaków");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Hasło musi zawierać co najmniej jedną małą literę");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Hasło musi zawierać co najmniej jedną wielką literę");
  }

  if (!/\d/.test(password)) {
    errors.push("Hasło musi zawierać co najmniej jedną cyfrę");
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push(
      "Hasło musi zawierać co najmniej jeden znak specjalny (@$!%*?&)"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// XSS Protection
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// SQL Injection Protection (dla Prisma)
export function sanitizeForDatabase(input: string): string {
  return input
    .trim()
    .replace(/['"\\]/g, "") // Usuń potencjalne znaki SQL
    .substring(0, 255); // Limit długości
}

// Session Security
export function generateSecureSessionId(): string {
  return randomBytes(32).toString("hex");
}

// IP Validation
export function isValidIP(ip: string): boolean {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Cleanup expired rate limit entries
export function cleanupRateLimit(): void {
  const now = Date.now();
  const entries = Array.from(rateLimitMap.entries());
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);
