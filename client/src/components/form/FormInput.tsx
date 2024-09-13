"use client";

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
import { useState } from "react";

interface FormInputProps {
  controller: Control<any>;
  label?: string;
  name: string;
  type?: string;
  autoComplete?: "on" | "off";
  limit?: number;
  showCharCount?: boolean;
  placeholder?: string;
  description?: string;
  errorDescription?: string;
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
  limit,
  showCharCount,
  description,
  errorDescription,
  autoComplete,
  className,
  alternative,
  alternativeText,
  alternativeAction,
}: FormInputProps) {
  const [charCount, setCharCount] = useState(0);

  return (
    <FormField
      control={controller}
      name={name}
      render={({ field }) => {
        const { onChange } = field;
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e);
          setCharCount(e.target.value.length);
        };

        return (
          <FormItem className="relative">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                className={`${className} text-base`}
                type={type || "text"}
                placeholder={placeholder}
                autoComplete={autoComplete || "on"}
                maxLength={limit}
                {...field}
                onChange={handleChange}
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
              className={
                errorDescription ? "text-xs !text-red-600" : "text-xs"
              }>
              <span className="flex items-center justify-between">
                <span>{errorDescription || description}</span>

                {showCharCount &&
                  !!limit &&
                  (charCount === 0 ? (
                    <span>{`0/${limit}`}</span>
                  ) : (
                    <span>{`${charCount}/${limit}`}</span>
                  ))}
              </span>
            </FormDescription>
          </FormItem>
        );
      }}
    />
  );
}
