import useAuthDialogs from "@/hooks/useAuthDialogs";
import { Button } from "../ui/button";
import { IoReorderThreeOutline } from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTheme } from "next-themes";
import Link from "next/link";
import { RxHamburgerMenu } from "react-icons/rx";

export default function SignedOutView() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="link" className="hidden sm:flex gap-3">
        <Link href="/auth?signin">Sign in</Link>
      </Button>
      <div className="flex gap-2">
        <Button asChild variant="outline" className="h-12 sm:h-10">
          <Link href="/auth?signup">
            {" "}
            <span className="hidden sm:block">Create account</span>
            <span className="sm:hidden text-lg">Sign up</span>
          </Link>
        </Button>

        <div className="h-10 sm:hidden">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger aria-label="menu">
              <div className="relative sm:hidden sm:my-0 p-1 px-2">
                <RxHamburgerMenu className="" size={40} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild className="text-lg">
                <Link href="/auth?signin">Sign in</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-lg" onClick={toggleTheme}>
                Switch theme
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
