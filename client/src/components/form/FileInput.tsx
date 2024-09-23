import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Input } from "../ui/input";

interface FileInputProps {
  controller: Control<any>;
  label?: string;
  name: string;
  description?: string;
  errorDescription?: string;
  className?: string;
  accept?: string;
}

export default function FileInput({
  controller,
  label,
  name,
  description,
  errorDescription,
  className,
  accept,
}: FileInputProps) {
  return (
    <FormField
      control={controller}
      name={name}
      render={({ field: { value, onChange, ...fieldProps } }) => (
        <FormItem className="relative">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              accept={accept}
              className={className}
              type="file"
              onChange={(event) =>
                onChange(event.target.files && event.target.files[0])
              }
              {...fieldProps}
            />
          </FormControl>
          <FormDescription
            className={errorDescription ? "text-xs !text-red-600" : "text-xs"}>
            {errorDescription || description}
          </FormDescription>
        </FormItem>
      )}
    />
  );
}
