import http from "@/lib/http";
import {
  EditProfileBody,
  SignInBody,
  SignUpBody,
  User,
} from "@/validation/schema/user";

const UserAPI = {
  signup: async (input: SignUpBody) => {
    const res = await http.post<User>("/auth/signup", input);
    return res.payload;
  },
  signin: async (input: SignInBody) => {
    const res = await http.post<User>("/auth/signin", input);
    return res.payload;
  },
  signout: async () => await http.post("/auth/signout"),

  getAuthenticatedUser: async () => {
    const res = await http.get<User>("/auth/me");
    return res.payload;
  },
  getUser: async (username: string) => {
    const res = await http.get<User>("/auth/users/" + username);
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
