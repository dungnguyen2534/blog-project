import MarkdownRenderer from "@/components/MarkdownRenderer";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import { cache } from "react";
import { cookies } from "next/headers";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import ArticlesAPI from "@/api/article";
import ArticlesContextProvider from "@/context/ArticlesContext";
import ArticleTags from "@/components/articles/ArticleTags";
import ArticleOptions from "@/components/articles/ArticleOptions";
import CommentSection from "@/components/comments/CommentSection";
import InArticleLike from "@/components/articles/InArticleLike";
import NavigateBackButton from "./NavigateBackButton";
import ArticleContent from "./ArticleContent";

const getArticle = cache(async (slug: string, cookies?: RequestCookie) => {
  try {
    return await ArticlesAPI.getArticle(slug, cookies);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    } else {
      throw error;
    }
  }
});

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await ArticlesAPI.getSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params: { slug } }: ArticlePageProps) {
  const article = await getArticle(slug);
  return {
    title: article.title,
    description: article.summary,
  };
}

export default async function ArticlePage({
  params: { slug },
}: ArticlePageProps) {
  const article = await getArticle(slug);

  return (
    <div className="secondary-container ring-1 ring-[#f0f0f0] dark:ring-0 mt-[4rem] md:!mt-[4.5rem] md:mb-2 p-3 sm:pt-7 rounded-none sm:rounded-md">
      <ArticleContent article={article} />
      <CommentSection article={article} />
    </div>
  );
}
