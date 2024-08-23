"use client";

import UserAPI from "@/api/user";
import FileInput from "@/components/form/FileInput";
import FormInput from "@/components/form/FormInput";
import FormWrapper from "@/components/form/FormWrapper";
import TextField from "@/components/form/TextField";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import useAuth from "@/hooks/useAuth";
import { ConflictError } from "@/lib/http-errors";
import revalidateCachedData from "@/lib/revalidate";
import {
  EditProfileBody,
  EditProfileBodySchema,
  User,
} from "@/validation/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface ProfileEditorProps {
  user: User;
}

export default function ProfileEditor({ user }: ProfileEditorProps) {
  const defaultValues = {
    username: user.username,
    about: user.about || "",
    profilePicture: undefined,
  };

  const form = useForm<EditProfileBody>({
    resolver: zodResolver(EditProfileBodySchema),
    defaultValues,
  });

  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { toast } = useToast();
  const { mutateUser } = useAuth();

  async function onSubmit(values: EditProfileBody) {
    setIsSubmitting(true);

    try {
      const updatedUser = await UserAPI.updateUser(values);

      revalidateCachedData("/users/" + user.username); // remove old user page from cache
      revalidateCachedData("/users/" + updatedUser.username);

      mutateUser(updatedUser);
      setIsSubmitting(false);
      setShowDialog(false);

      router.push("/users/" + updatedUser.username);
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof ConflictError) {
        toast({
          title: "Username already taken",
          description: "Please choose another username",
        });
      } else {
        toast({
          title: "An error occurred",
          description: "Please try again later",
        });
      }
    }
  }

  const { isDirty } = form.formState;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <FormWrapper
          form={form}
          submitFunction={onSubmit}
          className="flex flex-col gap-3">
          <FileInput
            controller={form.control}
            label="Profile picture"
            name="profilePicture"
            accept="image/*"
            className="!-mb-3"
          />
          <FormInput
            controller={form.control}
            label="Username"
            name="username"
            placeholder="Your new username"
            autoComplete="off"
            limit={20}
            className="!-mb-3"
          />
          <TextField
            controller={form.control}
            label="About"
            name="about"
            placeholder="A short bio about yourself"
            limit={200}
          />
          <LoadingButton
            text="Save"
            loadingText="Saving..."
            loading={isSubmitting}
            disabled={!isDirty}
          />
        </FormWrapper>
      </DialogContent>
    </Dialog>
  );
}
