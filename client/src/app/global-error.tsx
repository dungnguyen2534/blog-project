"use client";
import { TbFaceIdError } from "react-icons/tb";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex flex-col gap-3 items-center justify-center h-screen px-3">
        <TbFaceIdError size={200} />
        <h1 className="font-medium text-center text-base sm:text-xl">
          An internal server error occurred, please comeback later.
        </h1>
      </body>
    </html>
  );
}