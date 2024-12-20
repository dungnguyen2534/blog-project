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
    <div className="secondary-container px-4 pt-3 !pb-1 sm:!pb-2 md:p-4 w-full flex flex-col gap-3 rounded-none md:rounded-md main-outline">
      <div className="flex gap-[0.35rem] h-10">
        <Skeleton className="h-[2.4rem] w-[2.4rem] rounded-full" />
        <div className="flex flex-col justify-evenly gap-1">
          <Skeleton className="w-24 h-3" />
          <Skeleton className="w-[6.8rem] h-[0.65rem]" />
        </div>
      </div>

      <div className="md:ml-[2.85rem] pb-3">
        <Skeleton className="w-full h-7 mb-3" />
        <div className="flex flex-col gap-4">
          <Skeleton className="w-3/4 h-4" />
          <div className="flex justify-between">
            <Skeleton className="w-20 sm:w-32 h-4 mt-1" />
            <Skeleton className="w-20 h-4 mt-1 mr-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
