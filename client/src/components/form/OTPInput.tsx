import React from "react";
import { FormDescription, FormField, FormItem, FormLabel } from "../ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { Control } from "react-hook-form";

interface OTPInputProps {
  controller: Control<any>;
  name: string;
  description?: string;
  errorDescription?: string;
}

export default function OTPInput({
  controller,
  name,
  description,
  errorDescription,
}: OTPInputProps) {
  return (
    <div className="flex flex-col items-center my-3">
      <FormField
        control={controller}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex justify-center py-1 text-sm">
              Check your email for the OTP code
            </FormLabel>
            <FormDescription
              className={
                errorDescription
                  ? "text-xs text-center !text-red-600 pb-1"
                  : "text-xs text-center pb-1"
              }>
              {errorDescription || description}
            </FormDescription>
            <InputOTP maxLength={6} {...field}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </FormItem>
        )}
      />
    </div>
  );
}
