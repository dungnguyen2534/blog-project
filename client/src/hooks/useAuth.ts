import useSWR from "swr";
import AuthAPI from "@/api/auth";
import { UnauthorizedError } from "@/lib/http-errors";

export default function useAuth() {
  const { data, isLoading, isValidating, error, mutate } = useSWR(
    "authenticated_user",
    async () => {
      try {
        return await AuthAPI.getAuthenticatedUser();
      } catch (error) {
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
    isLoadingUserError: error,
    mutateUser: mutate,
  };
}
