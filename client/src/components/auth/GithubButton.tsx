import Link from "next/link";
import { Button } from "../ui/button";
import { BsGithub } from "react-icons/bs";

export default function GithubButton() {
  return (
    <Button asChild variant="outline" className="w-full">
      <Link href="">
        <BsGithub size={20} className="mr-1" /> Github
      </Link>
    </Button>
  );
}
