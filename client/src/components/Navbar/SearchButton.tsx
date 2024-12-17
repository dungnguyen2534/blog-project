"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { useCallback, useState, useTransition } from "react";
import useSWR from "swr";
import SearchAPI from "@/api/search";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import useDebounce from "@/hooks/useDebounce";
import { LoaderCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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

      const data = await SearchAPI.search(searchQuery);
      return data;
    },
    {
      revalidateOnFocus: false,
    }
  );

  const noArticles = !(data?.articles && data.articles.length > 0);
  const noTags = !(data?.tags && data.tags.length > 0);
  const noUsers = !(data?.users && data.users.length > 0);

  const [_, startTransition] = useTransition();

  const closeSearch = useCallback(() => {
    startTransition(() => {
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
            className={isLoading ? "pr-10" : ""}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <LoaderCircle className="animate-spin" />
            </div>
          )}
        </div>

        <Tabs
          defaultValue="articles"
          className="flex flex-col flex-grow overflow-hidden -mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <div className="flex-grow overflow-y-scroll scrollbar-thin">
            <TabsContent value="articles" className="space-y-3">
              {noArticles && searchQuery.trim() != "" && !isLoading && (
                <div>No result for &quot;{searchQuery}&quot;</div>
              )}

              {!noArticles && (
                <div className="flex flex-col mt-2">
                  {data.articles.map((article) => {
                    return (
                      <Button
                        onClick={() => closeSearch()}
                        asChild
                        key={article._id}
                        className="mb-1 text-wrap flex-col items-start justify-start w-fit h-fit"
                        variant="outline">
                        <Link href={`/articles/${article.slug}`}>
                          <h3 className="[overflow-wrap:anywhere]">
                            {article.title}
                          </h3>
                          <small>
                            <span className="font-normal">by</span>{" "}
                            {article.author.username}
                          </small>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            <TabsContent value="tags" className="space-y-3">
              {noTags && searchQuery.trim() != "" && !isLoading && (
                <div>No result for &quot;{searchQuery}&quot;</div>
              )}

              {!noTags && (
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
              )}
            </TabsContent>
            <TabsContent value="users" className="space-y-3">
              {noUsers && searchQuery.trim() != "" && !isLoading && (
                <div>No result for &quot;{searchQuery}&quot;</div>
              )}

              {!noUsers && (
                <div className="flex flex-wrap gap-2 mt-2">
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
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
