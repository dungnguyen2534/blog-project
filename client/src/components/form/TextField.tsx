import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Button } from "../ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TextFieldProps {
  controller: Control<any>;
  label?: string;
  name: string;
  autoComplete?: "on" | "off";
  placeholder?: string;
  limit?: number;
  description?: string;
  errorDescription?: string;
  className?: string;
  alternative?: boolean;
  alternativeText?: string;
  alternativeAction?: () => void;
  resizable?: boolean;
}

export default function TextField({
  controller,
  label,
  name,
  placeholder,
  limit,
  description,
  errorDescription,
  className,
  alternative,
  alternativeText,
  alternativeAction,
  resizable = true,
}: TextFieldProps) {
  return (
    <FormField
      control={controller}
      name={name}
      render={({ field }) => (
        <FormItem className="relative">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              className={`${className} ${
                resizable ? "" : "resize-none"
              } text-base`}
              placeholder={placeholder}
              {...field}
              maxLength={limit}
            />
          </FormControl>
          {alternative && (
            <Button
              onClick={alternativeAction}
              variant="link"
              type="button"
              className="absolute -top-[11px] -right-4 mt-1 text-xs text-blue-500">
              {alternativeText}
            </Button>
          )}
          <FormDescription
            className={errorDescription ? "text-xs !text-red-600" : "text-xs"}>
            {errorDescription || description}
          </FormDescription>
        </FormItem>
      )}
    />
  );
}
