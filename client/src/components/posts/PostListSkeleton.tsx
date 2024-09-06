import { Skeleton } from "../ui/skeleton";

interface PostListSkeletonProps {
  skeletonCount?: number;
  className?: string;
}

export default function PostListSkeleton({
  skeletonCount,
  className,
}: PostListSkeletonProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: skeletonCount ?? 12 }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="secondary-container px-2 py-3 !pb-12 sm:p-4 w-full flex flex-col gap-2 rounded-md shadow-sm ring-1 ring-neutral-100 dark:ring-neutral-900">
      <div className="flex gap-2 h-10">
        <Skeleton className="h-[2.4rem] w-[2.4rem] rounded-full" />

        <div className="flex flex-col justify-evenly">
          <Skeleton className="w-24 h-[0.8rem]" />
          <Skeleton className="w-48 h-[0.6rem]" />
        </div>
      </div>

      <div className="md:ml-[2.85rem]">
        <Skeleton className="w-full h-8 mb-3" />
        <div className="flex flex-col gap-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
        </div>
      </div>
    </div>
  );
}