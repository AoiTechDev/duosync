import { Skeleton } from "./ui/skeleton";

const PostSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card/70 p-5" aria-hidden>
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full bg-popover" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 bg-popover" />
          <Skeleton className="h-3 w-20 bg-popover" />
        </div>
      </div>
      <Skeleton className="size-14 rounded-xl bg-popover" />
    </div>
    <Skeleton className="mt-5 h-3.5 w-full bg-popover" />
    <Skeleton className="mt-2 h-3.5 w-3/4 bg-popover" />
    <div className="mt-6 grid grid-cols-3 gap-2">
      <Skeleton className="h-12 rounded-xl bg-popover" />
      <Skeleton className="h-12 rounded-xl bg-popover" />
      <Skeleton className="h-12 rounded-xl bg-popover" />
    </div>
  </div>
);

export default PostSkeleton;
