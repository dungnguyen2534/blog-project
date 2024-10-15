import PostsAPI from "@/api/post";
import TagsAPI from "@/api/tag";
import PostList from "@/components/posts/PostList";
import PostsContextProvider from "@/context/PostsContext";
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
    title: capitalizedTag + " - Devdaily",
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
      initialPage = await PostsAPI.getPostList(`/posts?tag=${tag}`, userCookie);
    } catch {
      initialPage = undefined;
    }
  }

  return (
    <PostsContextProvider initialPage={initialPage} tag={tag}>
      <main className="container px-0 sm:px-8 my-[0.35rem] md:my-2">
        <TagInfo
          tagName={tag}
          followerCount={tagInfo.followerCount}
          postCount={tagInfo.postCount}
          isLoggedInUserFollowing={tagInfo.isLoggedInUserFollowing}
        />
        <PostList tag={tag} />
      </main>
    </PostsContextProvider>
  );
}
