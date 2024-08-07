"use client";

import MdEditor from "react-markdown-editor-lite";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import MarkdownRenderer from "../MarkdownRenderer";
import "react-markdown-editor-lite/lib/index.css";

interface MarkdownEditorProps {
  controller: Control<any>;
  label?: string;
  name: string;
  placeholder?: string;
  description?: string;
  className?: string;
}

export default function MarkdownEditor({
  controller,
  label,
  name,
  placeholder,
  description,
}: MarkdownEditorProps) {
  return (
    <FormField
      control={controller}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <MdEditor
              value={field.value}
              style={{ height: "50vh" }}
              renderHTML={(text) => <MarkdownRenderer>{text}</MarkdownRenderer>}
              onChange={({ text }) => field.onChange(text)}
              placeholder={placeholder}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
        </FormItem>
      )}
    />
  );
}
