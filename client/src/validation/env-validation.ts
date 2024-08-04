import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SERVER_URL: z.string(),
});

const configEnv = envSchema.safeParse({
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
});

if (!configEnv.success) {
  console.log(configEnv.error.issues);
  throw new Error("Environment variables are not set correctly");
}

const env = configEnv.data;
export default env;
