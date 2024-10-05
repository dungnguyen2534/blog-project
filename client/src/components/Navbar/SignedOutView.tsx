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

export default function SignedOutView() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="ghost" className="hidden sm:flex gap-3">
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
            <DropdownMenuTrigger>
              {/* div instead of button because of hydration error */}
              <div
                className="relative h-12 w-12 dark:bg-neutral-950 border-[1px] rounded-md transition-colors dark:hover:bg-stone-800 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
                aria-label="Open menu">
                <IoReorderThreeOutline
                  size={40}
                  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
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
