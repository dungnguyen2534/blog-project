"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidatePathData(
  path: string,
  type?: "layout" | "page"
) {
  revalidatePath(path, type);
}

export async function revalidateTagData(tag: string) {
  revalidateTag(tag);
}
