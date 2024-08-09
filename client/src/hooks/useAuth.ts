import useSWR from "swr";
import UserAPI from "@/api/user";
import { UnauthorizedError } from "@/lib/http-errors";

export default function useAuth() {
  const { data, isLoading, isValidating, error, mutate } = useSWR(
    "authenticated_user",
    async () => {
      try {
        return await UserAPI.getAuthenticatedUser();
      } catch (error) {
        // prevent SWR auto re-fetching the user if signed out
        if (error instanceof UnauthorizedError) {
          return null;
        } else {
          throw error;
        }
      }
    }
  );

  return {
    user: data,
    isLoadingUser: isLoading,
    isValidatingUser: isValidating,
    loadUserError: error,
    mutateUser: mutate,
  };
}
