import http from "@/lib/http";
import { SignInBody, SignUpBody, User } from "@/validation/schema/user";

const UserAPI = {
  signup: async (input: SignUpBody) => {
    const res = await http.post<User>("/users/signup", input);
    return res.payload;
  },
  signin: async (input: SignInBody) => {
    const res = await http.post<User>("/users/signin", input);
    return res.payload;
  },
  signout: async () => await http.post("/users/signout"),
  getAuthenticatedUser: async () => {
    const res = await http.get<User>("/users/me");
    return res.payload;
  },
};

export default UserAPI;
