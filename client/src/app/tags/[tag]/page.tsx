import TagsAPI from "@/api/tag";
import ArticleList from "@/components/articles/ArticleList";
import ArticlesContextProvider from "@/context/ArticlesContext";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import TagInfo from "./TagInfo";
import { cookies } from "next/headers";

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

  return (
    <main className="container px-0 sm:px-8 mt-[4rem] md:!mt-[4.57rem]">
      <TagInfo
        tagName={tag}
        followerCount={tagInfo.followerCount}
        articleCount={tagInfo.articleCount}
        isLoggedInUserFollowing={tagInfo.isLoggedInUserFollowing}
      />
      <ArticleList tag={tag} />
    </main>
  );
}
