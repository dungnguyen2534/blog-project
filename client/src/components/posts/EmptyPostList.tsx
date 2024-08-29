import { PiSmileyMeltingFill } from "react-icons/pi";

interface EmptyPostListProps {
  text: string;
  hideIcon?: boolean;
  className?: string;
}

export default function EmptyPostList({
  text,
  hideIcon,
  className,
}: EmptyPostListProps) {
  return (
    <div
      className={
        "flex flex-col gap-2 items-center justify-center " + className
      }>
      {!hideIcon && (
        <PiSmileyMeltingFill
          size={80}
          className="text-neutral-700 dark:text-white"
        />
      )}
      <h1 className="font-medium">{text}</h1>
    </div>
  );
}
