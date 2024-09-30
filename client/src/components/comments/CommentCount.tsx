"use client";

import useCommentsLoader from "@/hooks/useCommentsLoader";
import usePostsLoader from "@/hooks/usePostsLoader";
import { useEffect, useRef, useState } from "react";

interface CommentCountProps {
  postId: string;
  initialCountServerSide?: number;
}

/*
initialCountServerSide is used to set the initial count when user accesses the page directly from the URL
because the initialCount from postList will not be available in that case. Other cases will use the initialCount, initialCountServerSide not always shows latest count.
*/
export default function CommentCount({
  postId,
  initialCountServerSide,
}: CommentCountProps) {
  const { postList } = usePostsLoader();
  const initialCount = postList.find(
    (post) => post._id === postId
  )?.commentCount;

  const [count, setCount] = useState(
    initialCount || initialCountServerSide || 0
  );

  // TODO: make this shit work when create/delete comments

  return <>{count > 0 ? `(${count})` : ""}</>;
}
