import React from "react";
import { Button } from "./ui/button";
import { LoaderCircle } from "lucide-react";

interface LoadingButtonProps {
  loading: boolean;
  text: string;
  loadingText?: string;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export default function LoadingButton({
  loading,
  text,
  loadingText,
  onClick,
  disabled = false,
  type,
  className,
}: LoadingButtonProps) {
  return (
    <Button
      className={className}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}>
      {loading && <LoaderCircle className="mr-2 animate-spin" />}
      {loading && loadingText ? loadingText : text}
    </Button>
  );
}
