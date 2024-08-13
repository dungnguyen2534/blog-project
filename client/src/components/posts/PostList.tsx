"use client";

import EmptyPostList from "./EmptyPostList";
import PostEntry from "./PostEntry";
import usePostListLoader from "@/hooks/usePostListLoader";

export default function PostsList() {
  const {
    posts,
    isLoadingPostList,
    isLoadingPostListError: error,
  } = usePostListLoader();

  return (
    <div className="flex flex-col gap-3 m-auto">
      {!error && !isLoadingPostList && posts.length === 0 && (
        <EmptyPostList text="No one has posted yet, be the first!" />
      )}

      {error && <EmptyPostList text="Failed to load posts" />}

      {posts.map((post) => (
        <PostEntry key={post._id} {...post} />
      ))}
    </div>
  );
}
