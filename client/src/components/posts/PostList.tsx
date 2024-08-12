"use client";

import PostEntry from "./PostEntry";
import { PiSmileyMeltingFill } from "react-icons/pi";
import usePostLoader from "@/hooks/usePostLoader";

export default function PostsList() {
  const { posts, isLoadingPosts, isPostsLoadingError: error } = usePostLoader();

  return (
    <div className="flex flex-col gap-3 xl:w-7/12 m-auto">
      {!error && !isLoadingPosts && posts.length === 0 && (
        <EmptyPostList errorText="No one has posted yet, be the first!" />
      )}

      {error && <EmptyPostList errorText="Failed to load posts" />}

      {posts.map((post) => (
        <PostEntry key={post._id} {...post} slug={post.slug} />
      ))}
    </div>
  );
}

function EmptyPostList({ errorText }: { errorText: string }) {
  return (
    <div className="flex flex-col gap-2 items-center justify-center mt-48">
      <PiSmileyMeltingFill
        size={80}
        className="text-neutral-700 dark:text-white"
      />
      <h1 className="font-medium">{errorText}</h1>
    </div>
  );
}
