import ArticlesAPI from "@/api/article";
import TagsAPI from "@/api/tag";
import ArticleList from "@/components/articles/ArticleList";
import ArticlesContextProvider from "@/context/ArticlesContext";
import { NotFoundError } from "@/lib/http-errors";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import TagInfo from "./TagInfo";

interface TagPageProps {
  params: { tag: string };
}

export async function generateMetadata({ params: { tag } }: TagPageProps) {
  const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
  return {
    title: capitalizedTag + " - Devflow",
  };
}

export default async function TagPage({ params: { tag } }: TagPageProps) {
  const userCookie = cookies().get("connect.sid");

  let initialPage;
  let tagInfo;

  try {
    tagInfo = await TagsAPI.getTagInfo(tag, userCookie);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    } else {
      throw error;
    }
  }

  if (tagInfo) {
    try {
      initialPage = await ArticlesAPI.getArticleList(
        `/articles?tag=${tag}`,
        userCookie
      );
    } catch {
      initialPage = undefined;
    }
  }

  return (
    <ArticlesContextProvider initialPage={initialPage} tag={tag}>
      <div className="container px-0 sm:px-8 my-[0.35rem] md:my-2">
        <TagInfo
          tagName={tag}
          followerCount={tagInfo.followerCount}
          articleCount={tagInfo.articleCount}
          isLoggedInUserFollowing={tagInfo.isLoggedInUserFollowing}
        />
        <ArticleList tag={tag} />
      </div>
    </ArticlesContextProvider>
  );
}
