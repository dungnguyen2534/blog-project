import Link from "next/link";
import { ModeToggle } from "./ui/mode-toggle";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0  secondary-color border-b-[1px] py-3">
      <div className="container flex relative">
        {/* Logo goes here */}
        <Link
          href={"/"}
          className="absolute top-1/2 transform -translate-y-1/2 text-xl font-black">
          BLOG-PROJECT
        </Link>

        <div className="flex justify-center items-center gap-3 ml-auto">
          <ModeToggle />
          <Button asChild variant="outline" className="border-2">
            <Link href="/create-post">Create post</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
