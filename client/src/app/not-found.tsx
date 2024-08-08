import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-2xl font-medium">Page not found</p>
      <Link href="/" className="text-blue-600 mt-4 flex items-center gap-1">
        <ArrowLeft size={18} />
        To home page
      </Link>
    </div>
  );
}
