"use client";

import { Button } from "../ui/button";
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
import { useCallback, useState, useTransition } from "react";
import useSWR from "swr";
import SearchAPI from "@/api/search";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import useDebounce from "@/hooks/useDebounce";
import { LoaderCircle } from "lucide-react";

interface SearchButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export default function SearchButton({ children, asChild }: SearchButtonProps) {
  const [open, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchQuery = useDebounce(searchValue, 500);

  const { data, isLoading } = useSWR(
    `/search/searchQuery=${searchQuery}`,
    async () => {
      if (searchQuery.trim() === "") return;

      const data = await SearchAPI.quickSearch(searchQuery);
      return data;
    },
    {
      revalidateOnFocus: false,
    }
  );

  const noArticles = !(data?.articles && data.articles.length > 0);
  const noTags = !(data?.tags && data.tags.length > 0);
  const noUsers = !(data?.users && data.users.length > 0);
  const noData = noArticles && noTags && noUsers;

  const [_, startTransition] = useTransition();

  const closeSearch = useCallback(() => {
    startTransition(() => {
      setSearchValue("");
      setIsOpen(false);
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>

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
            className={isLoading ? "pr-32" : "pr-24"}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          {isLoading && (
            <div className="absolute right-24 top-1/2 -translate-y-1/2">
              <LoaderCircle className="animate-spin" />
            </div>
          )}

          <LoadingButton
            loading={false}
            text="Submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-[80%] rounded-sm"
            variant="secondary"
          />
        </div>

        <div className="flex-grow space-y-3 pb-3 overflow-y-scroll scrollbar-thin">
          {noData && searchQuery.trim() != "" && (
            <div>No result for &quot;{searchQuery}&quot;</div>
          )}

          {!noArticles && (
            <div>
              <h3>Articles:</h3>
              <div className="flex flex-col mt-2">
                {data.articles.map((article) => {
                  return (
                    <Button
                      onClick={() => closeSearch()}
                      asChild
                      key={article._id}
                      className="mb-1 flex-col items-start justify-start w-fit h-fit"
                      variant="outline">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="p-2 rounded-md border">
                        <p>{article.title}</p>
                        <small>
                          <span className="font-normal">by</span>{" "}
                          {article.author.username}
                        </small>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {!noTags && (
            <div>
              <div>Tags:</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.tags.map((tag) => {
                  return (
                    <Button
                      asChild
                      key={tag._id}
                      variant="outline"
                      onClick={() => closeSearch()}>
                      <Link href={`/tags/${tag.tagName.slice(1)}`}>
                        <div>{tag.tagName}</div>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {!noUsers && (
            <div>
              <div>Users:</div>
              <div className="flex flex-col gap-2 mt-2">
                {data?.users.map((user) => {
                  return (
                    <Button
                      onClick={() => closeSearch()}
                      key={user._id}
                      variant="outline"
                      className="w-fit py-6 px-3">
                      <Link
                        href={`/users/${user.username}`}
                        className="flex items-center gap-2">
                        <UserAvatar profilePicUrl={user.profilePicPath} />
                        <h3 className="mb-1">{user.username}</h3>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-auto text-muted-foreground text-sm pt-1 border-t-2">
          Submit for more results
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
