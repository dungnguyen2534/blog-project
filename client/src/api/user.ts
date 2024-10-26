import http from "@/lib/http";
import {
  EditProfileBody,
  ForgotPasswordBody,
  SignInBody,
  SignUpBody,
  User,
} from "@/validation/schema/user";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

const UserAPI = {
  getOTP: async (email: string) => await http.post("/auth/get-otp", { email }),
  signup: async (input: SignUpBody) => {
    const res = await http.post<User>("/auth/signup", input);
    return res.payload;
  },
  signin: async (input: SignInBody) => {
    const res = await http.post<User>("/auth/signin", input);
    return res.payload;
  },
  getResetPasswordOTP: async (email: string) =>
    await http.post("/auth/get-reset-password-otp", { email }),
  resetPassword: async (input: ForgotPasswordBody) => {
    const res = await http.post<User>("/auth/reset-password", input);
    return res.payload;
  },
  signout: async () => await http.post("/auth/signout"),
  getAuthenticatedUser: async (cookie?: RequestCookie) => {
    const res = await http.get<User>("/auth/me", {
      headers: {
        cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
      next: { tags: ["authenticated-user"] },
    });
    return res.payload;
  },
  getUser: async (username: string, cookie?: RequestCookie) => {
    const res = await http.get<User>("/auth/users/" + username, {
      headers: {
        cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
      next: { tags: ["user"] },
    });
    return res.payload;
  },
  updateUser: async (input: EditProfileBody) => {
    const formData = new FormData();
    Object.entries(input).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const res = await http.patch<User>("/auth/me", formData);
    return res.payload;
  },
  followUser: async (userId: string) => {
    const res = await http.post<{ totalFollowers: number }>(
      `/auth/users/${userId}/follow`
    );
    return res.payload;
  },
  unFollowUser: async (userId: string) => {
    const res = await http.delete<{ totalFollowers: number }>(
      `/auth/users/${userId}/unfollow`
    );
    return res.payload;
  },
  getFollowers: async () => {
    const res = await http.get<User[]>(`/auth/users/me/followers`);
    return res.payload;
  },
  getFollowing: async () => {
    const res = await http.get<User[]>(`/auth/users/me/following`);
    return res.payload;
  },
};

export default UserAPI;
