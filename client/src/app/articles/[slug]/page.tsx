import MarkdownRenderer from "@/components/MarkdownRenderer";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import { cache } from "react";
import CommentSection from "@/components/comments/CommentSection";
import { cookies } from "next/headers";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import ArticlesAPI from "@/api/article";
import ArticlesContextProvider from "@/context/ArticlesContext";
import ArticleTags from "@/components/articles/ArticleTags";
import ArticleOptions from "@/components/articles/ArticleOptions";
import InArticleLike from "@/components/articles/InArticleLike";

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
  const userCookie = cookies().get("connect.sid");
  const article = await getArticle(slug, userCookie);

  return (
    <ArticlesContextProvider>
      <article className="secondary-container ring-1 ring-[#f4f4f4] dark:ring-neutral-950 md:my-[0.5rem] p-3 sm:pt-7 rounded-none sm:rounded-md">
        <div className="max-w-prose m-auto flex flex-col gap-3 break-words pb-5 border-b-[1px]">
          <header>
            <h1 className="text-3xl sm:text-4xl font-black mt-2 mb-3">
              {article.title}
            </h1>
            <ArticleTags tags={article.tags} className="mb-3" />
            <ArticleOptions article={article} author={article.author} />
          </header>
          <MarkdownRenderer>{article.body}</MarkdownRenderer>
        </div>
        <InArticleLike article={article} />
        <CommentSection article={article} userCookie={userCookie} />
      </article>
    </ArticlesContextProvider>
  );
}
