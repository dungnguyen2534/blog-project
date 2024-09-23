"use client";

import { useCallback, useRef, useState } from "react";
import PostEntry from "./PostEntry";
import EmptyPostList from "./EmptyPostList";
import { User } from "@/validation/schema/user";
import PostListSkeleton from "./PostListSkeleton";
import { Post, PostPage } from "@/validation/schema/post";
import PostsAPI from "@/api/post";

interface PostsListProps {
  initialPage: PostPage;
  author?: User;
  tag?: string;
}

export default function PostsList({
  author,
  initialPage,
  tag,
}: PostsListProps) {
  const [postList, setPostList] = useState<Post[]>(initialPage.posts);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLoadError, setPageLoadError] = useState(false);

  const pageIndexRef = useRef(pageIndex);
  pageIndexRef.current = pageIndex;

  const fetchNextPage = useCallback(
    async (author?: User, tag?: string, limit?: number) => {
      const url = `/posts?${tag ? `tag=${tag}` : ""}${
        author ? `&authorId=${author._id}` : ""
      }&page=${pageIndexRef.current + 1}${limit ? `&limit=${limit}` : ""}`;

      try {
        setPageIndex(pageIndexRef.current + 1);
        if (pageIndexRef.current >= initialPage.totalPages) return;

        const nextPage = await PostsAPI.getPostList(url);
        setPostList((prevPostList) => [...prevPostList, ...nextPage.posts]);
      } catch (error) {
        setPageLoadError(true);
      }
    },
    [initialPage.totalPages]
  );

  // using useCallback as a ref makes the useCallback be called when the ref shows up
  const postRef = useCallback(
    (postEntry: HTMLElement | null) => {
      if (postEntry == null) return;

      const observer = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage(author, tag, 12);
            observer.unobserve(postEntry);
          }
        },
        {
          rootMargin: "150px",
        }
      );

      observer.observe(postEntry);
    },
    [author, tag, fetchNextPage]
  );

  return (
    <>
      <div className="flex flex-col gap-[0.35rem] md:gap-2 m-auto">
        {!author && !initialPage && (
          <EmptyPostList text="Failed to load posts" className="mt-48" />
        )}

        {author && !initialPage && (
          <EmptyPostList
            text={`Failed to load ${author.username}'s posts`}
            hideIcon
          />
        )}

        {!author && initialPage.posts.length === 0 && (
          <EmptyPostList
            text={
              tag
                ? `No posts found with tag: ${tag}`
                : "No one has posted yet, be the fist!"
            }
            className="mt-48"
          />
        )}

        {author && initialPage.posts.length === 0 && (
          <EmptyPostList
            text={`${author.username} hasn't post anything yet...`}
            hideIcon
          />
        )}

        {initialPage &&
          postList.map((post, index) => (
            <PostEntry
              key={post._id}
              post={post}
              ref={index === postList.length - 1 ? postRef : null}
            />
          ))}

        {pageIndex <= initialPage.totalPages && !pageLoadError && (
          <PostListSkeleton skeletonCount={3} />
        )}
      </div>
    </>
  );
}
