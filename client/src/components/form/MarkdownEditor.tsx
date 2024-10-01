"use client";

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
import { TooManyRequestsError, UnauthorizedError } from "@/lib/http-errors";
import MdEditor from "react-markdown-editor-lite";
import { useEffect, useRef } from "react";

interface MarkdownEditorProps {
  controller: Control<any>;
  label?: string;
  name: string;
  placeholder?: string;
  description?: string;
  className?: string;
  height?: string;
  showMenu?: boolean;
  showPreview?: boolean;
  autoFocus?: boolean;
  forComment?: { postId: string };
  defaultValue?: string;
}

export default function MarkdownEditor({
  controller,
  label,
  name,
  placeholder,
  description,
  height,
  showMenu = true,
  showPreview = true,
  forComment,
  autoFocus,
  className,
  defaultValue,
}: MarkdownEditorProps) {
  const { toast } = useToast();
  async function uploadInPostImage(image: File) {
    try {
      if (forComment) {
        const res = await PostsAPI.uploadInCommentImage(
          forComment.postId,
          image
        );
        return res.imageUrl;
      } else {
        const res = await PostsAPI.uploadInPostImage(image);
        return res.imageUrl;
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You need to login to upload images",
        });
      } else if (error instanceof TooManyRequestsError) {
        toast({
          title: "Too many images uploaded",
          description:
            "You can only upload 60 images per hour, please try again later",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred while uploading the image",
        });
      }
    }
  }

  // Access the the editor to place the cursor at the end of the default text
  // for some reason the autoFocus place the cursor at the beginning when using react-hook-form defaultValues, and setFocus is not working
  const editorRef = useRef<any>(null);
  useEffect(() => {
    if (autoFocus && editorRef.current) {
      const editor = editorRef.current.getMdElement(); // this is how to get the textarea editor element based on the docs
      if (editor) {
        editor.focus();
        editor.setSelectionRange(editor.value.length, editor.value.length);
      }
    }
  }, [autoFocus]);

  return (
    <FormField
      control={controller}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <MdEditor
              ref={editorRef}
              className={className}
              value={field.value}
              style={{ height: height || "50vh" }}
              renderHTML={(text) => <MarkdownRenderer>{text}</MarkdownRenderer>}
              onChange={({ text }) => field.onChange(text)}
              placeholder={placeholder}
              onImageUpload={uploadInPostImage}
              imageAccept=".png, .jpg, .jpeg, .webp"
              view={{ html: showPreview, md: true, menu: showMenu }}
              autoFocus={autoFocus}
              defaultValue={defaultValue}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
        </FormItem>
      )}
    />
  );
}
