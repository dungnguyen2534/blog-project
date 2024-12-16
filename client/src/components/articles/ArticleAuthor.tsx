"use client";

import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { Article } from "@/validation/schema/article";
import { formatDate, formatUpdatedDate } from "@/lib/utils";
import { TooltipTrigger } from "@/components/ui/tooltip";
import MiniProfile from "../MiniProfile";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import { User } from "@/validation/schema/user";

interface ArticleAuthorProps {
  article: Article;
  articleEntry?: boolean;
  author: User;
}

export default function ArticleAuthor({
  article,
  articleEntry,
  author,
}: ArticleAuthorProps) {
  let articleDate;
  if (!(article.createdAt !== article.updatedAt)) {
    articleDate = (
      <time
        suppressHydrationWarning
        className="text-xs text-neutral-500 dark:text-neutral-400"
        dateTime={article.createdAt}>
        {formatDate(article.createdAt)}
      </time>
    );
  } else {
    articleDate = (
      <time
        suppressHydrationWarning
        className="text-xs text-neutral-500 dark:text-neutral-400"
        dateTime={article.createdAt}>
        {`${formatDate(article.createdAt, false)} - ${formatUpdatedDate(
          article.updatedAt
        )}`}
      </time>
    );
  }

  const { handleArticleListChange } = useArticlesLoader();
  const { username, profilePicPath } = author;
  return (
    <MiniProfile author={author} customTrigger>
      <div className="relative flex">
        <TooltipTrigger asChild>
          <Link
            onClick={() => handleArticleListChange("/users/" + username)}
            href={"/users/" + username}
            className="flex gap-[0.4rem] items-center">
            <UserAvatar username={username} profilePicUrl={profilePicPath} />
            <span className="text-sm font-medium mb-5">{username}</span>
          </Link>
        </TooltipTrigger>
        <div className="text-nowrap text-xs text-neutral-500 dark:text-neutral-400 absolute bottom-0 left-11">
          {articleDate}
          {!articleEntry && <span> • {article.readingTime} min read </span>}
        </div>
      </div>
    </MiniProfile>
  );
}
