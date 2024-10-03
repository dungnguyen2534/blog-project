import { nanoid } from "nanoid";

export function slugify(title: string) {
  const slug =
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .replace(/ +/g, " ")
      .replace(/\s/g, "-")
      .toLowerCase() +
    "-" +
    nanoid(6);

  return slug;
}

// to make unique SEO friendly URLs: "some-random-title-Zq2rmJ"
