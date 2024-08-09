import useSWR from "swr";
import UserAPI from "@/api/user";

export default function useAuth() {
  const { data, isLoading, error, mutate } = useSWR(
    "user",
    UserAPI.getAuthenticatedUser
  );

  return {
    user: data,
    loadingUser: isLoading,
    loadUserError: error,
    mutateUser: mutate,
  };
}
