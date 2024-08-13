import { PiSmileyMeltingFill } from "react-icons/pi";

interface EmptyPostListProps {
  text: string;
}

export default function EmptyPostList({ text }: EmptyPostListProps) {
  return (
    <div className="flex flex-col gap-2 items-center justify-center mt-48">
      <PiSmileyMeltingFill
        size={80}
        className="text-neutral-700 dark:text-white"
      />
      <h1 className="font-medium">{text}</h1>
    </div>
  );
}
