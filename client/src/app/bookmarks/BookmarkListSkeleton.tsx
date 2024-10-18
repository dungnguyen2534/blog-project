import { Skeleton } from "@/components/ui/skeleton";

interface BookmarkListSkeletonProps {
  skeletonCount?: number;
  className?: string;
}

export default function BookmarkListSkeleton({
  className,
  skeletonCount,
}: BookmarkListSkeletonProps) {
  return (
    <div className={`flex flex-col gap-[0.35rem] sm:gap-2 ${className}`}>
      {Array.from({ length: skeletonCount ?? 12 }).map((_, index) => (
        <BookmarkSkeleton key={index} />
      ))}
    </div>
  );
}

function BookmarkSkeleton() {
  return (
    <div className="secondary-container px-2 py-3 sm:p-4 w-full flex flex-col gap-2 rounded-none sm:rounded-md shadow-sm ring-1 ring-neutral-100 dark:ring-neutral-900">
      <Skeleton className="w-full h-7" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-2/4 h-4 mt-2" />
    </div>
  );
}
