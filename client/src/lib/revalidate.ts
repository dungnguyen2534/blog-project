"use server";

import { revalidatePath } from "next/cache";

export default async function revalidateCachedData(
  path: string,
  type?: "layout" | "page"
) {
  revalidatePath(path, type);
}

// revalidatePath must be used in server actions or route handler
