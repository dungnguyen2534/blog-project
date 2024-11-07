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
  className?: string;
}

export default function SearchButton({ className }: SearchButtonProps) {
  const [searchValue, setSearchValue] = useState("");

  // TODO: useSWR to fetch search results

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`relative h-11 w-12 md:h-10 md:w-10 ${className}`}
          aria-label="Search">
          <RiMenuSearchLine
            size={24}
            className="absolute top-[53%] dark:top-[52%] -translate-y-1/2 hidden md:block"
          />
          <RiSearch2Line
            size={28}
            className="absolute top-1/2 -translate-y-1/2 block md:hidden"
          />
        </Button>
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
          <RiSearch2Line
            size={180}
            className="mx-auto mt-28 md:mt-20 text-muted-foreground"
          />
        </div>

        <DialogFooter className="mt-auto text-muted-foreground text-sm pt-1 border-t-2">
          Submit for more results
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
