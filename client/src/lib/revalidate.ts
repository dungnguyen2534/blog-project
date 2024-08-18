"use server";

import { revalidatePath } from "next/cache";

export default async function revalidateCachedData(path: string) {
  revalidatePath(path);
}

// according to the Next.js docs, the revalidatePath must be used in server actions or route handler
