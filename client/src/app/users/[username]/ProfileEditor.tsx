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
import { revalidatePathData, revalidateTagData } from "@/lib/revalidate";
import {
  EditProfileBody,
  EditProfileBodySchema,
  User,
} from "@/validation/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

interface ProfileEditorProps {
  user: User;
}

export default function ProfileEditor({ user }: ProfileEditorProps) {
  const defaultValues = useMemo(
    () => ({
      username: user.username,
      about: user.about || "",
      profilePicture: undefined,
    }),
    [user.username, user.about]
  );

  const form = useForm<EditProfileBody>({
    resolver: zodResolver(EditProfileBodySchema),
    defaultValues: {
      username: user.username,
      about: user.about || "",
      profilePicture: undefined,
    },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { mutateUser } = useAuth();

  const { isDirty } = form.formState;
  async function onSubmit(values: EditProfileBody) {
    if (
      !isDirty ||
      (form.watch("username") === defaultValues.username &&
        form.watch("about") === defaultValues.about)
    ) {
      setShowDialog(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await UserAPI.updateUser(values);

      revalidatePathData("/users/" + user.username); // remove old user page from cache
      revalidateTagData("authenticated-user");

      mutateUser(updatedUser);
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

  // only when data have actually changed, close dialog and reset isSubmitting
  useEffect(() => {
    setShowDialog(false);
    setIsSubmitting(false);
    form.reset({
      username: defaultValues.username,
      about: defaultValues.about,
      profilePicture: undefined,
    });
  }, [defaultValues, user.profilePicPath, form]);

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
          className="flex flex-col gap-1">
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
            showCharCount
          />
          <LoadingButton
            text="Save"
            loadingText="Saving..."
            loading={isSubmitting}
          />
        </FormWrapper>
      </DialogContent>
    </Dialog>
  );
}
