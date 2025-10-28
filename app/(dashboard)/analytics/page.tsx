import React, { Suspense } from "react";
import AnalyticsWrapper from "./analytics-wrapper";
import { ChartSkeleton } from "@/app/shared/components/skeleton-loader";

export default function AnalyticsPage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <Suspense fallback={<ChartSkeleton />}>
        <AnalyticsWrapper />
      </Suspense>
    </div>
  );
}
