import { ObjectId } from "mongodb";

export function shortid(id: ObjectId) {
  const buffer = Buffer.from(id.toString(), "hex");
  const shortedId = buffer.toString("base64");
  return shortedId;
}

export function slugify(title: string) {
  const slug = title
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/ +/g, " ")
    .replace(/\s/g, "-")
    .toLowerCase();

  return slug;
}

// make unique SEO friendly URLs: "Zq2rmJyEFZgHHlpS/some-random-title"
