"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PostsAPI from "@/api/post";
import useAuth from "@/hooks/useAuth";
import useNavigation from "@/hooks/useNavigation";

export function NavigationEvents() {
  const { user: authenticatedUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pathname, prevUrl } = useNavigation();

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
    if (prevUrl.startsWith("/posts/") && prevUrl !== pathname) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(deleteUnusedImages, 1500);
    }

    return () => {
      window.removeEventListener("beforeunload", deleteUnusedImages);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, router, searchParams, authenticatedUser, prevUrl]);

  return null;
}
