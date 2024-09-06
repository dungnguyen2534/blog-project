import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-slide-bg dark:animate-slide-bg-dark rounded-md bg-neutral-100 dark:bg-neutral-800",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
