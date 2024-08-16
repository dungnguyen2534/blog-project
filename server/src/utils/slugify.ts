export function slugify(title: string) {
  const slug = title
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/ +/g, " ")
    .replace(/\s/g, "-")
    .toLowerCase();

  return slug;
}

// to make unique SEO friendly URLs: "some-random-title-Zq2rmJyEFZgHHlpS"
