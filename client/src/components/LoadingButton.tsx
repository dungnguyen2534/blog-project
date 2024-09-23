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
  variant?:
    | "default"
    | "outline"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
}

export default function LoadingButton({
  loading,
  text,
  loadingText,
  onClick,
  disabled = false,
  type,
  className,
  variant,
}: LoadingButtonProps) {
  return (
    <Button
      variant={variant}
      className={className}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}>
      {loading ? (
        <>
          <LoaderCircle className="mr-2 animate-spin" />
          {loadingText && loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
}
