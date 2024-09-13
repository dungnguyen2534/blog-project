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
import { useEffect, useRef, useState } from "react";

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

  return (
    <FormField
      control={controller}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <MdEditor
              className={className}
              value={field.value}
              style={{ height: height || "50vh" }}
              renderHTML={(text) => <MarkdownRenderer>{text}</MarkdownRenderer>}
              onChange={({ text }) => field.onChange(text)}
              placeholder={placeholder}
              onImageUpload={uploadInPostImage}
              imageAccept=".png, .jpg, .jpeg"
              view={{ html: showPreview, md: true, menu: showMenu }}
              autoFocus={autoFocus}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
        </FormItem>
      )}
    />
  );
}
