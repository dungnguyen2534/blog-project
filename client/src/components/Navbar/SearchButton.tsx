"use client";

import { Button } from "../ui/button";
import { RiMenuSearchLine } from "react-icons/ri";
import { RiSearch2Line } from "react-icons/ri";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import LoadingButton from "../LoadingButton";
import { useState } from "react";

interface SearchButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export default function SearchButton({ children, asChild }: SearchButtonProps) {
  const [searchValue, setSearchValue] = useState("");

  // TODO: useSWR to fetch search results

  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>
        {children}
      </DialogTrigger>
      <DialogContent className="flex flex-col h-dvh md:h-[80dvh] [&>button]:scale-[2.25] md:[&>button]:scale-110">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            You can search for articles, tags and users
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Input
            placeholder="What are you looking for"
            className="pr-24"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <LoadingButton
            loading={false}
            text="Submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-[80%] rounded-sm"
            variant="secondary"
          />
        </div>

        <div className="flex-grow">
          {/* TODO: use shadcn scroll area to render search data here */}
        </div>

        <DialogFooter className="mt-auto text-muted-foreground text-sm pt-1 border-t-2">
          Submit for more results
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
