import React from "react";
import { Button } from "./ui/button";
import { LoaderCircle } from "lucide-react";

interface LoadingButtonProps {
  loading: boolean;
  text: string;
  loadingText?: string;
  type?: "button" | "submit" | "reset";
}

export default function LoadingButton({
  loading,
  text,
  loadingText,
  type,
}: LoadingButtonProps) {
  return (
    <Button disabled={loading} type={type}>
      {loading && <LoaderCircle className="mr-2 animate-spin" />}
      {loading && loadingText ? loadingText : text}
    </Button>
  );
}
