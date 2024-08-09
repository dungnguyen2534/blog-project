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

interface EmailInputProps {
  controller: Control<any>;
  autoComplete?: "on" | "off";
  description?: string;
  errorDescription?: string;
  className?: string;
}

export default function EmailInput({
  controller,
  description,
  errorDescription,
  autoComplete,
  className,
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
                className={`${className} rounded-tr-none rounded-br-none`}
                type="email"
                placeholder="Your email address"
                autoComplete={autoComplete || "on"}
                {...field}
              />
            </FormControl>
            <Button
              variant="secondary"
              type="button"
              className="rounded-tl-none rounded-bl-none ">
              Get OTP
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
