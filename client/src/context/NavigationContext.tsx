"use client";

import { usePathname } from "next/navigation";
import { createContext, useEffect, useRef, useState } from "react";

interface NavigationContextType {
  pathname: string;
  prevUrl: string | undefined;
  setPrevUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  prevScrollPosition: number;
  setPrevScrollPosition: React.Dispatch<React.SetStateAction<number>>;
}

export const NavigationContext = createContext<NavigationContextType | null>(
  null
);

interface NavigationContextProviderProps {
  children: React.ReactNode;
}

export default function NavigationContextProvider({
  children,
}: NavigationContextProviderProps) {
  const pathname = usePathname();
  const prevUrlRef = useRef<string | null>(pathname);

  const [prevUrl, setPrevUrl] = useState<string | undefined>(undefined);

  // when user comment in an article, revalidateTag is used and it makes the page not scroll to previous position, so this is to handle that
  const [prevScrollPosition, setPrevScrollPosition] = useState<number>(0);

  useEffect(() => {
    if (prevUrlRef.current !== pathname) {
      setPrevUrl(prevUrlRef.current || undefined);
      if (
        prevScrollPosition > 0 &&
        prevUrlRef.current?.startsWith("/articles") &&
        !pathname.startsWith("/users")
      ) {
        window.scrollTo(0, prevScrollPosition);
      }

      prevUrlRef.current = pathname;
    }
  }, [pathname, prevScrollPosition, prevUrl]);

  return (
    <NavigationContext.Provider
      value={{
        pathname,
        prevUrl,
        setPrevUrl,
        prevScrollPosition,
        setPrevScrollPosition,
      }}>
      {children}
    </NavigationContext.Provider>
  );
}
