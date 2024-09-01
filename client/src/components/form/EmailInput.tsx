import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";

interface EmailInputProps {
  controller: Control<any>;
  autoComplete?: "on" | "off";
  description?: string;
  errorDescription?: string;
  className?: string;
  btnText?: string;
  countDown?: number;
  disabled?: boolean;
  loading?: boolean;
  onEmailSubmit: () => void;
}

export default function EmailInput({
  controller,
  description,
  errorDescription,
  autoComplete,
  className,
  btnText = "Get OTP",
  countDown,
  disabled,
  loading,
  onEmailSubmit,
}: EmailInputProps) {
  return (
    <FormField
      control={controller}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <div className="flex gap-1 items-center">
            <FormControl>
              <Input
                className={`${className} rounded-tr-none rounded-br-none text-base`}
                type="email"
                placeholder="Your email address"
                autoComplete={autoComplete || "on"}
                {...field}
              />
            </FormControl>
            <Button
              variant="secondary"
              type="button"
              className={`rounded-tl-none rounded-bl-none relative w-28 ${
                countDown && countDown > 0 ? "w-40" : ""
              }`}
              onClick={onEmailSubmit}
              disabled={disabled || loading}>
              <span
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                  countDown && countDown > 0 ? "left-[13%] translate-x-0" : ""
                }`}>
                {loading && <LoaderCircle className="mr-2 animate-spin" />}
                {!loading &&
                  `${btnText} 
                ${countDown && countDown > 0 ? `(${countDown})` : ""}`}
              </span>
            </Button>
          </div>
          <FormDescription
            className={errorDescription ? "!text-red-600 text-xs" : "text-xs"}>
            {errorDescription || description}
          </FormDescription>
        </FormItem>
      )}
    />
  );
}
