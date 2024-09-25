"use client";

import useCommentsLoader from "@/hooks/useCommentsLoader";
import { useEffect, useRef, useState } from "react";

interface CommentCountProps {
  initialCount: number;
}

export default function CommentCount({ initialCount }: CommentCountProps) {
  const [count, setCount] = useState(initialCount);
  const { commentList } = useCommentsLoader();

  const commentListRef = useRef(commentList);

  useEffect(() => {
    if (commentListRef.current.length + 1 === commentList.length) {
      setCount((prevCount) => prevCount + 1);
    } else if (commentListRef.current.length - 1 === commentList.length) {
      setCount((prevCount) => prevCount - 1);
    }

    commentListRef.current = commentList;
  }, [commentList]);

  return <>{count > 0 ? `(${count})` : ""}</>;
}
