import { Button } from "../ui/button";
import Link from "next/link";
import MobileMenu from "./MobileMenu";

export default function SignedOutView() {
  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="link" className="hidden md:flex gap-3">
        <Link href="/auth?signin">Sign in</Link>
      </Button>
      <div className="flex gap-2">
        <Button asChild variant="outline" className="h-12 md:h-10">
          <Link href="/auth?signup">
            <span className="hidden md:block">Create account</span>
            <span className="md:hidden text-lg">Sign up</span>
          </Link>
        </Button>

        <MobileMenu />
      </div>
    </div>
  );
}
