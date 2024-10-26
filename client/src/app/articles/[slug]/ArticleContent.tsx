"use client";

import { Article } from "@/validation/schema/article";
import React, { useState } from "react";
import NavigateBackButton from "./NavigateBackButton";
import ArticleTags from "@/components/articles/ArticleTags";
import ArticleOptions from "@/components/articles/ArticleOptions";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import InArticleLike from "@/components/articles/InArticleLike";
import useSWR from "swr";
import ArticlesAPI from "@/api/article";

interface ArticleContentProps {
  article: Article;
}

export default function ArticleContent({ article }: ArticleContentProps) {
  const [liked, setLiked] = useState<boolean | undefined>(false);
  const [isSaved, setIsSaved] = useState<boolean | undefined>(false);

  const articleStatus = useSWR("articleStatus", async () => {
    const articleStatus = await ArticlesAPI.getArticle(article.slug);
    setIsSaved(articleStatus.isSavedArticle);
    setLiked(articleStatus.isLoggedInUserLiked);
    return articleStatus;
  });

  return (
    <article>
      <div className="max-w-prose m-auto flex flex-col gap-3 break-words pb-5 border-b-[1px]">
        <header>
          <NavigateBackButton />
          <h1 className="text-3xl sm:text-4xl font-black mt-2 mb-3">
            {article.title}
          </h1>
          <ArticleTags tags={article.tags} className="mb-3" />
          <ArticleOptions
            article={article}
            isSaved={isSaved}
            setIsSaved={setIsSaved}
            isLoading={articleStatus.isLoading}
            author={article.author}
          />
        </header>
        <MarkdownRenderer>{article.body}</MarkdownRenderer>
      </div>
      <InArticleLike
        article={article}
        liked={liked}
        setLiked={setLiked}
        isLoading={articleStatus.isLoading}
      />
    </article>
  );
}
