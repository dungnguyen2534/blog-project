"use client";

import { useCallback, useRef } from "react";
import PostEntry from "./PostEntry";
import usePostsLoader from "@/hooks/usePostsLoader";
import EmptyPostList from "./EmptyPostList";
import { User } from "@/validation/schema/user";

interface PostsListProps {
  author?: User;
}

export default function PostsList({ author }: PostsListProps) {
  const {
    pages,
    isLoadingPage,
    pageToLoad,
    isLoadingPageError,
    setPageToLoad,
  } = usePostsLoader(author?._id);

  // put pageToLoad directly in the dependencies array will cause infinite loop because the callback mutate it
  const pageToLoadRef = useRef(pageToLoad);
  pageToLoadRef.current = pageToLoad;

  // useCallback as a ref makes the useCallback be called when the ref shows up
  const postRef = useCallback(
    (postEntry: HTMLElement | null) => {
      if (postEntry == null) return;

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPageToLoad(pageToLoadRef.current + 1);
          observer.unobserve(postEntry);
        }
      });

      observer.observe(postEntry);
    },
    [setPageToLoad]
  );

  if (isLoadingPage) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-3 m-auto">
      {!author && isLoadingPageError && (
        <EmptyPostList text="Failed to load posts" className="mt-48" />
      )}
      {!author &&
        !isLoadingPageError &&
        !isLoadingPage &&
        pages[0].posts.length === 0 && (
          <EmptyPostList
            text="No one has posted yet, be the first!"
            className="mt-48"
          />
        )}

      {author && isLoadingPageError && (
        <EmptyPostList
          text={`Failed to load ${author.username}'s posts`}
          hideIcon
        />
      )}
      {author &&
        !isLoadingPageError &&
        !isLoadingPage &&
        pages[0].posts.length === 0 && (
          <EmptyPostList
            text={`${author.username} hasn't post anything yet...`}
            hideIcon
          />
        )}

      {pages.map((page) =>
        page.posts.map((post, index) => (
          <PostEntry
            key={post._id}
            post={post}
            ref={index === page.posts.length - 1 ? postRef : null}
          />
        ))
      )}
    </div>
  );
}
