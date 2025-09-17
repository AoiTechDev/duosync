import React from "react";
import { Skeleton } from "./ui/skeleton";
import { Card } from "./ui/card";
const PostSkeleton = () => (
  <Card className="max-w-2xl mx-auto border border-border/30 bg-card">
    <div className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full mb-4" />
      <div className="bg-muted/20 rounded-xl p-4">
        <Skeleton className="h-4 w-20 mb-3" />
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  </Card>
);

export default PostSkeleton;
