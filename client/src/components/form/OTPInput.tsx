import React from "react";
import { FormField, FormItem, FormLabel } from "../ui/form";
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
}

export default function OTPInput({ controller, name }: OTPInputProps) {
  return (
    <div className="flex flex-col items-center my-3">
      <FormField
        control={controller}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex justify-center py-2 text-sm">
              Check your email for the OTP code
            </FormLabel>
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
