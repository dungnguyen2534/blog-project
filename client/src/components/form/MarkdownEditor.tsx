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
import PostsAPI from "@/api/post";
import { useToast } from "../ui/use-toast";
import React from "react";

interface MarkdownEditorProps {
  controller: Control<any>;
  label?: string;
  name: string;
  placeholder?: string;
  description?: string;
  className?: string;
  height?: string;
}

export default function MarkdownEditor({
  controller,
  label,
  name,
  placeholder,
  description,
  height,
}: MarkdownEditorProps) {
  const { toast } = useToast();

  async function uploadInPostImage(image: File) {
    try {
      const res = await PostsAPI.uploadInPostImage(image);
      return res.imageUrl;
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while uploading the image",
      });
    }
  }
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
              style={{ height: height || "50vh" }}
              renderHTML={(text) => <MarkdownRenderer>{text}</MarkdownRenderer>}
              onChange={({ text }) => field.onChange(text)}
              placeholder={placeholder}
              onImageUpload={uploadInPostImage}
              imageAccept=".png, .jpg, .jpeg"
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
        </FormItem>
      )}
    />
  );
}
