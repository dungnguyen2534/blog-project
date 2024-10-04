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
    });
    return res.payload;
  },
  getUser: async (username: string) => {
    const res = await http.get<User>("/auth/users/" + username, {
      cache: "no-cache",
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
};

export default UserAPI;
