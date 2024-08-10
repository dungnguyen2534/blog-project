import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-5">
      <div className="text-6xl font-black">Oops!</div>
      <div className="flex items-center  text-2xl  gap-2">
        <div>404</div>
        <Separator orientation="vertical" />
        <div>Page not found</div>
      </div>

      <Button asChild variant="link" className=" text-blue-500">
        <Link href="/">Back to home page</Link>
      </Button>
    </div>
  );
}
