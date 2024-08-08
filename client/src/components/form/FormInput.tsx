import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Input } from "../ui/input";

interface FormInputProps {
  controller: Control<any>;
  label?: string;
  name: string;
  type?: string;
  autoComplete?: "on" | "off";
  placeholder?: string;
  description?: string;
  className?: string;
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
}: FormInputProps) {
  return (
    <FormField
      control={controller}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              className={className}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              {...field}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
        </FormItem>
      )}
    />
  );
}
