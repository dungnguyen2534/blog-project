import useSWR from "swr";
import UserAPI from "@/api/user";

export default function useAuth() {
  const { data, isLoading, isValidating, error, mutate } = useSWR(
    "authenticated_user",
    async () => await UserAPI.getAuthenticatedUser(),
    {
      onErrorRetry(err) {
        if (err.status === 401) return;
      },
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
