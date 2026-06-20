import * as React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-20 animate-pulse">
      {/* Welcome header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <Card key={n} className="p-5 border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center space-x-4 h-24">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-28" />
            </div>
          </Card>
        ))}
      </div>

      {/* Grid of Main Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <Card className="lg:col-span-2 p-6 border-slate-800 bg-slate-900/60 backdrop-blur-md h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </Card>

        {/* Financial health score / side widget */}
        <Card className="p-6 border-slate-800 bg-slate-900/60 backdrop-blur-md h-80 flex flex-col items-center justify-between">
          <Skeleton className="h-5 w-36 self-start" />
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </Card>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <Card className="p-6 border-slate-800 bg-slate-900/60 backdrop-blur-md h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-3 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4.5 w-16" />
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming bills */}
        <Card className="p-6 border-slate-800 bg-slate-900/60 backdrop-blur-md h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-3 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-12" />
                  </div>
                </div>
                <Skeleton className="h-7 w-20 rounded-xl" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
