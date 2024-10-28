import { Skeleton } from "../ui/skeleton";

interface ArticleListSkeletonProps {
  skeletonCount?: number;
  className?: string;
}

export default function ArticleListSkeleton({
  skeletonCount,
  className,
}: ArticleListSkeletonProps) {
  return (
    <div className={`flex flex-col gap-[0.35rem] sm:gap-2 ${className}`}>
      {Array.from({ length: skeletonCount ?? 12 }).map((_, index) => (
        <ArticleSkeleton key={index} />
      ))}
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="secondary-container px-4 pt-3 !pb-1 sm:!pb-2 md:p-4 w-full flex flex-col gap-2 rounded-none md:rounded-sm ring-1 ring-[#f0f0f0] dark:ring-0">
      <div className="flex gap-2 h-10">
        <Skeleton className="h-[2.4rem] w-[2.4rem] rounded-full" />

        <div className="flex flex-col justify-evenly">
          <Skeleton className="w-24 h-[0.8rem]" />
          <Skeleton className="w-32 h-[0.6rem]" />
        </div>
      </div>

      <div className="md:ml-[2.85rem] pb-7">
        <Skeleton className="w-full h-7 mb-3" />
        <div className="flex flex-col gap-4">
          <Skeleton className="w-3/4 h-4" />
        </div>
      </div>
    </div>
  );
}
