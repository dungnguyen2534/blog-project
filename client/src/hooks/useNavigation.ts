import { NavigationContext } from "@/context/NavigationContext";
import { useContext } from "react";

export default function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error(
      "useNavigation must be used within a NavigationContextProvider"
    );
  }
  return context;
}
