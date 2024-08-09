import Link from "next/link";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";

export default function GoogleButton() {
  return (
    <Button asChild variant="outline" className="w-full ">
      <Link href="">
        <FcGoogle size={20} className="mr-1" /> Google
      </Link>
    </Button>
  );
}
