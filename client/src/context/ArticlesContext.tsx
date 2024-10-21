"use client";

import ArticlesAPI from "@/api/article";
import { Article, ArticlePage } from "@/validation/schema/article";
import { createContext, useCallback, useEffect, useState } from "react";

interface ArticlesContextType {
  articleList: Article[];
  fetchFirstPage: (
    authorId?: string,
    tag?: string,
    limit?: number,
    top?: boolean,
    timeSpan?: "week" | "month" | "year" | "infinity",
    followedTarget?: "users" | "tags" | "all",
    saved?: boolean
  ) => Promise<void>;
  fetchNextPage: (
    authorId?: string,
    tag?: string,
    limit?: number,
    top?: boolean,
    timeSpan?: "week" | "month" | "year" | "infinity",
    followedTarget?: "users" | "tags" | "all",
    saved?: boolean
  ) => Promise<void>;
  setArticleList: React.Dispatch<React.SetStateAction<Article[]>>;
  articlesLikeCount: { articleId: string; likeCount: number }[];
  setArticlesLikeCount: React.Dispatch<
    React.SetStateAction<{ articleId: string; likeCount: number }[]>
  >;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  lastArticleReached: boolean;
  pageLoadError: boolean;
  firstPageLoadError: boolean;
  savedTagList: string[] | undefined;
}

export const ArticlesContext = createContext<ArticlesContextType | null>(null);

interface ArticlesContextProps {
  children: React.ReactNode;
  initialPage?: ArticlePage;
  authorId?: string;
  tag?: string;
  top?: boolean;
  timeSpan?: "week" | "month" | "year" | "infinity" | undefined;
  followedTarget?: "users" | "tags" | "all";
  saved?: boolean;
  tagList?: string[];
  searchQuery?: string;
}

export default function ArticlesContextProvider({
  children,
  initialPage,
  authorId,
  tag,
  top,
  timeSpan,
  followedTarget,
  saved,
  tagList,
  searchQuery,
}: ArticlesContextProps) {
  const [firstPageFetched, setFirstPageFetched] = useState(false);
  const [articleList, setArticleList] = useState<Article[]>(
    initialPage?.articles || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastArticleReached, setLastArticleReached] = useState(
    initialPage?.lastArticleReached ?? false
  );
  const [pageLoadError, setPageLoadError] = useState(false);
  const [firstPageLoadError, setFirstPageLoadError] = useState(false);

  const [articlesLikeCount, setArticlesLikeCount] = useState(
    saved
      ? []
      : articleList.map((article) => ({
          articleId: article._id,
          likeCount: article.likeCount,
        }))
  );

  const [savedTagList, setSavedTagList] = useState<string[] | undefined>(
    tagList
  );

  const continueAfterId = articleList[articleList.length - 1]?._id;
  const continueAfterLikeCount = articleList[articleList.length - 1]?.likeCount;

  const paramsCheck = useCallback(() => {
    if (
      (top && followedTarget) ||
      (top && saved) ||
      (followedTarget && saved)
    ) {
      throw new Error("Only one of top, followedTarget, or saved can be true");
    }

    if (top && !timeSpan) {
      throw new Error("Time span must be provided for top articles");
    }
  }, [top, followedTarget, saved, timeSpan]);

  useEffect(() => {
    setFirstPageFetched(false);
  }, [
    initialPage,
    authorId,
    tag,
    top,
    timeSpan,
    followedTarget,
    saved,
    searchQuery,
  ]);

  const fetchFirstPage = useCallback(
    async (
      authorId?: string,
      tag?: string,
      limit?: number,
      top?: boolean,
      timeSpan?: "week" | "month" | "year" | "infinity",
      followedTarget?: "users" | "tags" | "all",
      saved?: boolean
    ) => {
      paramsCheck();

      setFirstPageLoadError(false);
      setIsLoading(true);

      const query = `/articles?${tag ? `tag=${tag}` : ""}${
        authorId ? `&authorId=${authorId}` : ""
      }${limit ? `&limit=${limit}` : ""}`;

      try {
        let firstPage: ArticlePage;
        if (top) {
          firstPage = await ArticlesAPI.getTopArticles(
            timeSpan || "week",
            continueAfterId,
            continueAfterLikeCount.toString()
          );
        } else if (followedTarget) {
          firstPage = await ArticlesAPI.getArticleList(
            `/articles?followedTarget=${followedTarget}`
          );
        } else if (saved) {
          firstPage = await ArticlesAPI.getSavedArticles(tag, searchQuery);
        } else {
          firstPage = await ArticlesAPI.getArticleList(query);
        }

        setArticleList(firstPage.articles);
        setLastArticleReached(firstPage.lastArticleReached);
        setFirstPageFetched(true);
      } catch {
        setFirstPageFetched(false);
        setFirstPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [continueAfterId, continueAfterLikeCount, paramsCheck, searchQuery]
  );

  const fetchNextPage = useCallback(
    async (
      authorId?: string,
      tag?: string,
      limit?: number,
      top?: boolean,
      timeSpan?: "week" | "month" | "year" | "infinity",
      followedTarget?: "users" | "tags" | "all",
      saved?: boolean
    ) => {
      paramsCheck();

      setPageLoadError(false);
      setIsLoading(true);

      const query = `/articles?${tag ? `tag=${tag}` : ""}${
        authorId ? `&authorId=${authorId}` : ""
      }${continueAfterId ? `&continueAfterId=${continueAfterId}` : ""}${
        limit ? `&limit=${limit}` : ""
      }`;

      try {
        let nextPage: ArticlePage;
        if (top) {
          nextPage = await ArticlesAPI.getTopArticles(
            timeSpan || "week",
            continueAfterId,
            continueAfterLikeCount.toString()
          );
        } else if (followedTarget) {
          nextPage = await ArticlesAPI.getArticleList(
            `/articles?followedTarget=${followedTarget}&continueAfterId=${continueAfterId}`
          );
        } else if (saved) {
          nextPage = await ArticlesAPI.getSavedArticles(
            tag,
            searchQuery,
            continueAfterId
          );

          if (!tagList) {
            const savedTags = await ArticlesAPI.getSavedTags();
            setSavedTagList(savedTags);
          }
        } else {
          nextPage = await ArticlesAPI.getArticleList(query);
        }

        setArticleList((prevArticleList) => [
          ...prevArticleList,
          ...nextPage.articles,
        ]);
        setLastArticleReached(nextPage.lastArticleReached);
      } catch (error) {
        setIsLoading(false);
        setPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [continueAfterId, continueAfterLikeCount, paramsCheck, tagList, searchQuery]
  );

  useEffect(() => {
    if (!initialPage && !firstPageFetched) {
      if (top) {
        fetchFirstPage(undefined, undefined, 12, top, timeSpan);
      } else if (followedTarget) {
        fetchFirstPage(
          undefined,
          undefined,
          12,
          undefined,
          undefined,
          followedTarget
        );
      } else if (saved) {
        fetchFirstPage(
          undefined,
          tag,
          12,
          undefined,
          undefined,
          undefined,
          true
        );
      } else {
        fetchFirstPage(authorId, tag, 12);
      }
    }
  }, [
    initialPage,
    top,
    followedTarget,
    saved,
    fetchFirstPage,
    authorId,
    tag,
    timeSpan,
    firstPageFetched,
  ]);

  useEffect(() => {
    !saved &&
      setArticlesLikeCount(
        articleList.map((article) => ({
          articleId: article._id,
          likeCount: article.likeCount,
        }))
      );
  }, [articleList, setArticlesLikeCount, saved]);

  return (
    <ArticlesContext.Provider
      value={{
        articleList,
        setArticleList,
        fetchFirstPage,
        fetchNextPage,
        lastArticleReached,
        isLoading,
        setIsLoading,
        pageLoadError,
        firstPageLoadError,
        articlesLikeCount,
        setArticlesLikeCount,
        savedTagList,
      }}>
      {children}
    </ArticlesContext.Provider>
  );
}
