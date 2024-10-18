import { cookies } from "next/headers";
import Navbar from "./Navbar";
import UserAPI from "@/api/user";

export default async function NavbarWrapper() {
  const userCookie = cookies().get("connect.sid");
  let authenticatedUser = undefined;

  try {
    authenticatedUser = await UserAPI.getAuthenticatedUser(userCookie);
  } catch {
    authenticatedUser = undefined;
  }

  return <Navbar authenticatedUser={authenticatedUser} />;
}
