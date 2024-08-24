"use client";

import { useCallback, useRef } from "react";
import PostEntry from "./PostEntry";
import usePostsLoader from "@/hooks/usePostsLoader";

export default function PostsList() {
  const { pages, isLoadingPage, pageToLoad, setPageToLoad } = usePostsLoader();

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
