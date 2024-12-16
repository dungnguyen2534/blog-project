import http from "@/lib/http";
import {
  ForgotPasswordBody,
  SignInBody,
  SignUpBody,
  User,
} from "@/validation/schema/user";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

const authAPI = {
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
};

export default authAPI;
