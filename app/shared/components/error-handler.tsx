"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  RefreshCw,
  Clock,
  Wifi,
  Server,
  Shield,
  ArrowLeft,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorState {
  type: "rate_limit" | "network" | "server" | "unknown";
  message: string;
  retryAfter?: number;
  canRetry: boolean;
}

interface ErrorHandlerProps {
  error: ErrorState;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

const errorConfig = {
  rate_limit: {
    icon: Clock,
    title: "Zbyt wiele zapytań",
    description:
      "Wykonałeś zbyt wiele zapytań w krótkim czasie. Spróbuj ponownie za chwilę.",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    iconColor: "text-orange-500",
  },
  network: {
    icon: Wifi,
    title: "Problem z połączeniem",
    description: "Sprawdź połączenie internetowe i spróbuj ponownie.",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-500",
  },
  server: {
    icon: Server,
    title: "Błąd serwera",
    description:
      "Wystąpił problem po stronie serwera. Spróbuj ponownie za chwilę.",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-500",
  },
  unknown: {
    icon: AlertTriangle,
    title: "Wystąpił błąd",
    description:
      "Coś poszło nie tak. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-900/20",
    borderColor: "border-slate-200 dark:border-slate-800",
    iconColor: "text-slate-500",
  },
};

export default function ErrorHandler({
  error,
  onRetry,
  onGoHome,
  className,
}: ErrorHandlerProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const config = errorConfig[error.type];
  const Icon = config.icon;

  useEffect(() => {
    if (error.retryAfter && error.retryAfter > 0) {
      setCountdown(error.retryAfter);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev && prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [error.retryAfter]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-[400px] p-6",
        className
      )}
    >
      <Card
        className={cn(
          "w-full max-w-md border-2 shadow-lg",
          config.bgColor,
          config.borderColor
        )}
      >
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm">
            <Icon className={cn("w-8 h-8", config.iconColor)} />
          </div>

          {/* Title */}
          <h3 className={cn("text-xl font-semibold mb-3", config.color)}>
            {config.title}
          </h3>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {config.description}
          </p>

          {/* Countdown */}
          {countdown !== null && (
            <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Możesz spróbować ponownie za: {formatTime(countdown)}
                </span>
              </div>
            </div>
          )}

          {/* Error Details */}
          {error.message && (
            <Alert className="mb-6 text-left">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Szczegóły błędu:</strong> {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {error.canRetry && onRetry && (
              <Button
                onClick={onRetry}
                disabled={countdown !== null && countdown > 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {countdown !== null && countdown > 0
                  ? `Spróbuj ponownie (${formatTime(countdown)})`
                  : "Spróbuj ponownie"}
              </Button>
            )}

            {onGoHome && (
              <Button
                variant="outline"
                onClick={onGoHome}
                className="flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Strona główna
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
            <p>
              Jeśli problem się powtarza, skontaktuj się z{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                pomocą techniczną
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook do parsowania błędów API
export function useErrorHandler() {
  const parseApiError = (error: any): ErrorState => {
    // Sprawdź czy to błąd rate limiting
    if (error?.error === "Too many requests" || error?.status === 429) {
      return {
        type: "rate_limit",
        message: error.message || "Zbyt wiele zapytań",
        retryAfter: error.retryAfter || 60,
        canRetry: true,
      };
    }

    // Sprawdź czy to błąd sieci
    if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
      return {
        type: "network",
        message: "Brak połączenia z serwerem",
        canRetry: true,
      };
    }

    // Sprawdź czy to błąd serwera (5xx)
    if (error?.status >= 500) {
      return {
        type: "server",
        message: error.message || "Błąd serwera",
        canRetry: true,
      };
    }

    // Domyślny błąd
    return {
      type: "unknown",
      message: error?.message || "Nieznany błąd",
      canRetry: true,
    };
  };

  return { parseApiError };
}
