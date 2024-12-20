import http from "@/lib/http";
import { EditProfileBody, User } from "@/validation/schema/user";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

const UserAPI = {
  getUser: async (username: string, cookie?: RequestCookie) => {
    const res = await http.get<User>("/users/" + username, {
      headers: {
        cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
      next: { tags: ["user"] },
      cache: "no-cache",
    });
    return res.payload;
  },
  updateUser: async (input: EditProfileBody) => {
    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const res = await http.patch<User>("/users/me", formData);
    return res.payload;
  },
  followUser: async (userId: string) => {
    const res = await http.post<{ totalFollowers: number }>(
      `/users/${userId}/follow`
    );
    return res.payload;
  },
  unFollowUser: async (userId: string) => {
    const res = await http.delete<{ totalFollowers: number }>(
      `/users/${userId}/unfollow`
    );
    return res.payload;
  },
  getFollowers: async () => {
    const res = await http.get<User[]>(`/users/me/followers`);
    return res.payload;
  },
  getFollowing: async () => {
    const res = await http.get<User[]>(`/users/me/following`);
    return res.payload;
  },
};

export default UserAPI;
