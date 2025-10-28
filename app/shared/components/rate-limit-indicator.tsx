"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  isLimited: boolean;
  retryAfter?: number;
}

interface RateLimitIndicatorProps {
  endpoint: string;
  className?: string;
  showDetails?: boolean;
  onRateLimitHit?: (info: RateLimitInfo) => void;
}

export default function RateLimitIndicator({
  endpoint,
  className,
  showDetails = true,
  onRateLimitHit,
}: RateLimitIndicatorProps) {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState<number | null>(null);

  const checkRateLimit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoint, { method: "HEAD" });

      const limit = parseInt(response.headers.get("X-RateLimit-Limit") || "0");
      const remaining = parseInt(
        response.headers.get("X-RateLimit-Remaining") || "0"
      );
      const resetTime = parseInt(
        response.headers.get("X-RateLimit-Reset") || "0"
      );

      if (response.status === 429) {
        const data = await response.json();
        const info: RateLimitInfo = {
          limit,
          remaining: 0,
          resetTime,
          isLimited: true,
          retryAfter: data.retryAfter,
        };
        setRateLimitInfo(info);
        onRateLimitHit?.(info);
      } else {
        const info: RateLimitInfo = {
          limit,
          remaining,
          resetTime,
          isLimited: false,
        };
        setRateLimitInfo(info);
      }
    } catch (error) {
      console.error("Error checking rate limit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aktualizuj countdown co sekundę
  useEffect(() => {
    if (!rateLimitInfo?.resetTime) return;

    const updateCountdown = () => {
      const now = Date.now();
      const timeLeft = Math.max(
        0,
        Math.ceil((rateLimitInfo.resetTime - now) / 1000)
      );
      setTimeUntilReset(timeLeft);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [rateLimitInfo?.resetTime]);

  // Sprawdź rate limit przy mount
  useEffect(() => {
    checkRateLimit();
  }, [endpoint]);

  if (!rateLimitInfo || !rateLimitInfo.isLimited) return null;

  const getStatusColor = () => {
    if (rateLimitInfo.isLimited) return "text-red-600 dark:text-red-400";
    if (rateLimitInfo.remaining <= rateLimitInfo.limit * 0.2)
      return "text-orange-600 dark:text-orange-400";
    if (rateLimitInfo.remaining <= rateLimitInfo.limit * 0.5)
      return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getStatusIcon = () => {
    if (rateLimitInfo.isLimited) return AlertTriangle;
    if (rateLimitInfo.remaining <= rateLimitInfo.limit * 0.2) return Clock;
    if (rateLimitInfo.remaining <= rateLimitInfo.limit * 0.5) return Zap;
    return CheckCircle;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card
      className={cn(
        "border-0 shadow-sm transition-all duration-200",
        rateLimitInfo.isLimited
          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                rateLimitInfo.isLimited
                  ? "bg-red-100 dark:bg-red-900/50"
                  : "bg-slate-100 dark:bg-slate-700"
              )}
            >
              <StatusIcon className={cn("w-4 h-4", getStatusColor())} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {rateLimitInfo.isLimited ? "Rate limit przekroczony" : ""}
                </span>
              </div>

              {showDetails && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {rateLimitInfo.isLimited ? (
                    <span>
                      Spróbuj ponownie za{" "}
                      {timeUntilReset ? formatTime(timeUntilReset) : "..."}
                    </span>
                  ) : (
                    <span>
                      Reset za{" "}
                      {timeUntilReset ? formatTime(timeUntilReset) : "..."}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={checkRateLimit}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={cn("w-3 h-3", isLoading && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        {/* Warning Message */}
        {rateLimitInfo.isLimited && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800 dark:text-red-200">
                <p className="font-medium mb-1">Zbyt wiele zapytań</p>
                <p className="text-xs">
                  Wykonałeś zbyt wiele zapytań w krótkim czasie. Poczekaj{" "}
                  {timeUntilReset ? formatTime(timeUntilReset) : "chwilę"} przed
                  kolejną próbą.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
