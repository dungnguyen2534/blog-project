"use client";

import React, { useState } from "react";
import { FormControl, FormDescription, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

// Alternative version of FormInput component without the react-hook-form stuff
interface TextInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  limit?: number;
  showCharCount?: boolean;
  description?: string;
  errorDescription?: string;
  className?: string;
  alternative?: boolean;
  alternativeText?: string;
  alternativeAction?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: "on" | "off";
  defaultValue?: string;
}

export default function TextInput({
  label,
  type,
  placeholder,
  limit,
  showCharCount,
  description,
  errorDescription,
  className,
  alternative,
  alternativeText,
  alternativeAction,
  onChange,
  autoComplete,
  defaultValue,
}: TextInputProps) {
  const [charCount, setCharCount] = useState(0);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCharCount(e.target.value.length);
    onChange && onChange(e);
  }

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
          onChange={handleChange}
          defaultValue={defaultValue}
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
}
