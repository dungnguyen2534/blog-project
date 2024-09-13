"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PostsAPI from "@/api/post";
import useAuth from "@/hooks/useAuth";

export function NavigationEvents() {
  const { user: authenticatedUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pathRef = useRef(pathname);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // redirect user to onboarding page if they haven't set a username(social sign in)
    if (
      authenticatedUser &&
      !authenticatedUser.username &&
      pathname !== "/onboarding"
    ) {
      router.push(
        "/onboarding?returnTo=" +
          encodeURIComponent(
            pathname + (searchParams?.size ? "?" + searchParams : "")
          )
      );
    }

    if (!authenticatedUser && pathname === "/onboarding") {
      const returnTo = decodeURIComponent(searchParams?.get("returnTo") || "");
      router.push(returnTo || "/");
    }

    // delete unused images when user navigates away from from pages that have the markdown editor
    async function deleteUnusedImages() {
      await PostsAPI.deleteUnusedImages();
    }

    window.addEventListener("beforeunload", deleteUnusedImages);
    if (pathRef.current.startsWith("/posts/") && pathRef.current !== pathname) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(deleteUnusedImages, 1500);
    }

    pathRef.current = pathname;

    return () => {
      window.removeEventListener("beforeunload", deleteUnusedImages);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, router, searchParams, authenticatedUser]);

  return null;
}
