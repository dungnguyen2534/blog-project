import React from "react";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function MobileDropdown() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="sm:hidden">
      {!(pathname === "/posts/create-post") && (
        <>
          <DropdownMenuItem asChild className="text-lg">
            <Link href="/posts/create-post">Create post</Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-lg" onClick={toggleTheme}>
            Theme
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuSeparator />
    </div>
  );
}
