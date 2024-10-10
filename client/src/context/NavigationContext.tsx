"use client";

import { usePathname } from "next/navigation";
import { createContext, useEffect, useRef, useState } from "react";

interface NavigationContextType {
  pathname: string;
  prevUrl: string;
  setPrevUrl: React.Dispatch<React.SetStateAction<string>>;
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

  const [prevUrl, setPrevUrl] = useState<string>("/");

  useEffect(() => {
    if (prevUrlRef.current !== pathname) {
      setPrevUrl(prevUrlRef.current || "/");
      prevUrlRef.current = pathname;
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ pathname, prevUrl, setPrevUrl }}>
      {children}
    </NavigationContext.Provider>
  );
}
