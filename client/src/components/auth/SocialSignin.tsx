import Link from "next/link";
import { Button } from "../ui/button";
import { BsGithub } from "react-icons/bs";
import env from "@/validation/env-validation";
import { FcGoogle } from "react-icons/fc";
import { usePathname, useSearchParams } from "next/navigation";

export default function SocialSignin() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex gap-3 w-full justify-between">
      {/* Google */}
      <Button asChild variant="outline" className="w-full ">
        <Link
          href={
            env.NEXT_PUBLIC_SERVER_URL +
            "/auth/signin/google?returnTo=" +
            encodeURIComponent(
              pathname + (searchParams?.size ? "?" + searchParams : "")
            )
          }>
          <FcGoogle size={20} className="mr-1" /> Google
        </Link>
      </Button>

      {/* Github */}
      <Button asChild variant="outline" className="w-full">
        <Link
          href={
            env.NEXT_PUBLIC_SERVER_URL +
            "/auth/signin/github?returnTo=" +
            encodeURIComponent(
              pathname + (searchParams?.size ? "?" + searchParams : "")
            )
          }>
          <BsGithub size={20} className="mr-1" /> Github
        </Link>
      </Button>
    </div>
  );
}
