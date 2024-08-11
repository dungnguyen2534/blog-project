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

export default function SignedOutView() {
  const { showSignIn, showSignUp } = useAuthDialogs();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="link"
        onClick={showSignIn}
        className="hidden sm:flex gap-3">
        Sign in
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={showSignUp}
          className="h-12 ms:h-auto">
          <span className="hidden sm:block">Create account</span>
          <span className="sm:hidden text-lg">Sign up</span>
        </Button>

        <div className="sm:hidden">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <div className="relative h-12 w-12 dark:bg-neutral-950 border-[1px] rounded-md transition-colors  dark:hover:bg-stone-800 hover:bg-stone-100">
                <IoReorderThreeOutline
                  size={40}
                  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="text-lg" onClick={showSignIn}>
                Sign in
              </DropdownMenuItem>
              <DropdownMenuItem className="text-lg" onClick={toggleTheme}>
                Theme
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
