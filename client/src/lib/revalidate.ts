"use server";

import { revalidatePath } from "next/cache";

export default async function revalidateCachedData(
  path: string,
  type?: "layout" | "page"
) {
  revalidatePath(path, type);
}

// according to the Next.js docs, the revalidatePath must be used in server actions or route handler
