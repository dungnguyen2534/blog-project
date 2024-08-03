import { z, ZodString } from "zod";

export function requiredString(field: string): ZodString {
  return z.string().min(1, { message: `${field} is required.` });
}
