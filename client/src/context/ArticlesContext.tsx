"use client";

import ArticlesAPI from "@/api/article";
import { Article, ArticlePage } from "@/validation/schema/article";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useRef,
  useState,
  useTransition,
} from "react";

interface ArticlesContextType {
  articleList: Article[];
  fetchFirstPage: (
    authorId?: string,
    tag?: string,
    limit?: number,
    top?: boolean,
    timeSpan?: "week" | "month" | "year" | "infinity",
    followedTarget?: "users" | "tags" | "all",
    saved?: boolean,
    searchQuery?: string
  ) => Promise<void>;
  fetchNextPage: (
    authorId?: string,
    tag?: string,
    limit?: number,
    top?: boolean,
    timeSpan?: "week" | "month" | "year" | "infinity",
    followedTarget?: "users" | "tags" | "all",
    saved?: boolean,
    searchQuery?: string
  ) => Promise<void>;
  setArticleList: React.Dispatch<React.SetStateAction<Article[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  lastArticleReached: boolean;
  setLastArticleReached: React.Dispatch<React.SetStateAction<boolean>>;
  pageLoadError: boolean;
  firstPageFetched: boolean;
  setFirstPageFetched: React.Dispatch<React.SetStateAction<boolean>>;
  firstPageLoadError: boolean;
  handleArticleListChange: (targetPathname: string) => void;
  isChangingArticleList: boolean;
  cacheRef: React.MutableRefObject<{ [key: string]: Article[] }>;
}

export const ArticlesContext = createContext<ArticlesContextType | null>(null);

interface ArticlesContextProps {
  children: React.ReactNode;
}

export default function ArticlesContextProvider({
  children,
}: ArticlesContextProps) {
  const [articleList, setArticleList] = useState<Article[]>([]);
  const [firstPageFetched, setFirstPageFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastArticleReached, setLastArticleReached] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(false);
  const [firstPageLoadError, setFirstPageLoadError] = useState(false);

  const pathname = usePathname();
  const cacheRef = useRef<{ [key: string]: Article[] }>({});

  const continueAfterId = articleList[articleList.length - 1]?._id;
  const continueAfterLikeCount = articleList[articleList.length - 1]?.likeCount;

  const fetchFirstPage = useCallback(
    async (
      authorId?: string,
      tag?: string,
      limit?: number,
      top?: boolean,
      timeSpan?: "week" | "month" | "year" | "infinity",
      followedTarget?: "users" | "tags" | "all",
      saved?: boolean,
      searchQuery?: string
    ) => {
      if (
        (top && followedTarget) ||
        (top && saved) ||
        (followedTarget && saved)
      ) {
        throw new Error(
          "Only one of top, followedTarget, or saved can be true"
        );
      }

      if (top && !timeSpan) {
        throw new Error("Time span must be provided for top articles");
      }

      setFirstPageLoadError(false);
      setIsLoading(true);

      const query = `/articles?${tag ? `tag=${tag}` : ""}${
        authorId ? `&authorId=${authorId}` : ""
      }${limit ? `&limit=${limit}` : ""}`;

      try {
        let firstPage: ArticlePage;
        if (top) {
          firstPage = await ArticlesAPI.getTopArticles(timeSpan || "week");
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
        cacheRef.current[pathname] = firstPage.articles;
        setLastArticleReached(firstPage.lastArticleReached);
        setFirstPageFetched(true);
      } catch {
        setFirstPageFetched(false);
        setFirstPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [pathname]
  );

  const fetchNextPage = useCallback(
    async (
      authorId?: string,
      tag?: string,
      limit?: number,
      top?: boolean,
      timeSpan?: "week" | "month" | "year" | "infinity",
      followedTarget?: "users" | "tags" | "all",
      saved?: boolean,
      searchQuery?: string
    ) => {
      if (
        (top && followedTarget) ||
        (top && saved) ||
        (followedTarget && saved)
      ) {
        throw new Error(
          "Only one of top, followedTarget, or saved can be true"
        );
      }

      if (top && !timeSpan) {
        throw new Error("Time span must be provided for top articles");
      }

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
        } else {
          nextPage = await ArticlesAPI.getArticleList(query);
        }

        setArticleList((prevArticleList) => {
          cacheRef.current[pathname] = [
            ...prevArticleList,
            ...nextPage.articles,
          ];
          return [...prevArticleList, ...nextPage.articles];
        });

        setLastArticleReached(nextPage.lastArticleReached);
      } catch (error) {
        setIsLoading(false);
        setPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [continueAfterId, continueAfterLikeCount, pathname]
  );

  // All navigation in Next built on transition, useTransition to prevent set state before navigation
  const [isChangingArticleList, startTransition] = useTransition();
  const handleArticleListChange = useCallback(
    (targetPathname: string) => {
      if (targetPathname && pathname === targetPathname) {
        return;
      }

      startTransition(() => {
        cacheRef.current[targetPathname] = [];
        setArticleList([]);
        setFirstPageLoadError(false);
        setLastArticleReached(false);
        setPageLoadError(false);
        setFirstPageFetched(false);
      });
    },
    [pathname]
  );

  return (
    <ArticlesContext.Provider
      value={{
        articleList,
        setArticleList,
        fetchFirstPage,
        setFirstPageFetched,
        firstPageFetched,
        fetchNextPage,
        setLastArticleReached,
        lastArticleReached,
        isLoading,
        setIsLoading,
        pageLoadError,
        firstPageLoadError,
        handleArticleListChange,
        isChangingArticleList,
        cacheRef,
      }}>
      {children}
    </ArticlesContext.Provider>
  );
}
