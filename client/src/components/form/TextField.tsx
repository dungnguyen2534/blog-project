"use client";

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
import { useState } from "react";

interface TextFieldProps {
  controller: Control<any>;
  label?: string;
  name: string;
  autoComplete?: "on" | "off";
  placeholder?: string;
  limit?: number;
  showCharCount?: boolean;
  description?: string;
  errorDescription?: string;
  className?: string;
  alternative?: boolean;
  alternativeText?: string;
  alternativeAction?: () => void;
  resizable?: boolean;
  autoFocus?: boolean;
}

export default function TextField({
  controller,
  label,
  name,
  placeholder,
  limit,
  showCharCount,
  description,
  errorDescription,
  className,
  alternative,
  alternativeText,
  alternativeAction,
  resizable = true,
  autoFocus,
}: TextFieldProps) {
  const [charCount, setCharCount] = useState(0);

  return (
    <FormField
      control={controller}
      name={name}
      render={({ field }) => {
        const { onChange } = field;
        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          onChange(e);
          setCharCount(e.target.value.length);
        };

        return (
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
                onChange={handleChange}
                autoFocus={autoFocus}
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
