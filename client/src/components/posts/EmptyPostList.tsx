import { PiSmileyMeltingFill } from "react-icons/pi";
import { Button } from "../ui/button";

interface EmptyPostListProps {
  text: string;
  hideIcon?: boolean;
  className?: string;
  retryFunction?: () => Promise<void>;
}

export default function EmptyPostList({
  text,
  hideIcon,
  className,
  retryFunction,
}: EmptyPostListProps) {
  return (
    <div
      className={
        "my-3 flex flex-col gap-2 items-center justify-center " + className
      }>
      {!hideIcon && (
        <PiSmileyMeltingFill
          size={80}
          className="text-neutral-700 dark:text-white"
        />
      )}
      <h1 className="font-medium">{text}</h1>
      <Button variant="outline" onClick={retryFunction}>
        Try again
      </Button>
    </div>
  );
}
