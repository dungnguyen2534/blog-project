"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import PostsAPI from "@/api/post";

// The current version of the Next.js app router does not have any built-in way to listen to navigation events.
// This is a workaround to delete unused images when navigating away from the create post page.

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ref persists between renders so it can store prev pathname
  const ref = useRef(pathname);

  useEffect(() => {
    async function deleteUnusedImages() {
      await PostsAPI.deleteUnusedImages();
    }

    if (ref.current == "/posts/create-post" && ref.current !== pathname) {
      deleteUnusedImages();
    }

    ref.current = pathname;
  }, [pathname, searchParams]);

  return null;
}
