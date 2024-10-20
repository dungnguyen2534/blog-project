import Link from "next/link";
import { Button } from "./ui/button";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

interface EditorGuideButtonProps {
  hideText?: boolean;
}

export default function EditorGuideButton({
  hideText,
}: EditorGuideButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">
          <RxQuestionMarkCircled size={22} className="mr-1" />
          {!hideText && <span>Editor Guide</span>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        Coming soon...
        <Link
          className="text-sm underline text-blue-500 dark:text-neutral-400 flex items-center gap-1"
          href="/editor-guide"
          target="_blank">
          See in new page
        </Link>
      </DialogContent>
    </Dialog>
  );
}
