"use client";

import useCommentsLoader from "@/hooks/useCommentsLoader";

export default function CommentCount() {
  const { commentCount } = useCommentsLoader();

  return <>{commentCount > 0 ? `(${commentCount})` : ""}</>;
}
