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

interface FormInputProps {
  controller: Control<any>;
  label?: string;
  name: string;
  type?: string;
  autoComplete?: "on" | "off";
  placeholder?: string;
  description?: string;
  className?: string;
  alternative?: boolean;
  alternativeText?: string;
  alternativeAction?: () => void;
}

export default function FormInput({
  controller,
  label,
  name,
  type,
  placeholder,
  description,
  autoComplete,
  className,
  alternative,
  alternativeText,
  alternativeAction,
}: FormInputProps) {
  return (
    <FormField
      control={controller}
      name={name}
      render={({ field }) => (
        <FormItem className="relative">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              className={className}
              type={type || "text"}
              placeholder={placeholder}
              autoComplete={autoComplete || "on"}
              {...field}
            />
          </FormControl>
          {alternative && (
            <Button
              onClick={alternativeAction}
              variant="link"
              className="absolute -top-[11px] -right-4 mt-1 text-xs text-blue-500">
              {alternativeText}
            </Button>
          )}
          <FormDescription className="text-xs">{description}</FormDescription>
        </FormItem>
      )}
    />
  );
}
