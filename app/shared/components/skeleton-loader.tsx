"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SkeletonLoaderProps {
  type?: "table" | "card" | "list" | "chart";
  count?: number;
  className?: string;
}

export default function SkeletonLoader({
  type = "table",
  count = 5,
  className,
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case "table":
        return (
          <div className="space-y-4">
            {/* Table Header */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
            {/* Table Rows */}
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
        );

      case "card":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
              <Card key={i} className={className}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "list":
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        );

      case "chart":
        return (
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-center space-x-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        );
    }
  };

  return <div className={className}>{renderSkeleton()}</div>;
}

// Specialized skeleton components
export function TableSkeleton({ count = 5 }: { count?: number }) {
  return <SkeletonLoader type="table" count={count} />;
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return <SkeletonLoader type="card" count={count} />;
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return <SkeletonLoader type="list" count={count} />;
}

export function ChartSkeleton() {
  return <SkeletonLoader type="chart" count={1} />;
}
