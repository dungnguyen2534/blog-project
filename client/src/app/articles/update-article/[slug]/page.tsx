import ArticlesAPI from "@/api/article";
import { NotFoundError } from "@/lib/http-errors";
import { Article } from "@/validation/schema/article";
import { notFound } from "next/navigation";
import ArticleUpdater from "./ArticleUpdater";

interface UpdateArticlePageProps {
  params: { slug: string };
}

export default async function UpdateArticlePage({
  params: { slug },
}: UpdateArticlePageProps) {
  let article: Article;

  try {
    article = await ArticlesAPI.getArticle(slug);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    } else {
      throw error;
    }
  }

  return <ArticleUpdater article={article} />;
}
