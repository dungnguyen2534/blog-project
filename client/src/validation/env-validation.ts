import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SERVER_URL: z.string(),
});

const configEnv = envSchema.safeParse(process.env);

if (!configEnv.success) {
  throw new Error("Environment variables are not set correctly");
}

const env = configEnv.data;
export default env;
