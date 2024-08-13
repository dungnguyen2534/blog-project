import Markdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import addClasses from "rehype-class-names";

interface MarkdownRendererProps {
  children: string;
}

export default function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <Markdown
      className="markdown max-w-full"
      remarkPlugins={[
        remarkGfm,
        [remarkToc, { maxDepth: 3, tight: true, prefix: "user-content-" }],
      ]}
      rehypePlugins={[
        rehypeSlug,
        rehypeAutolinkHeadings,
        rehypeSanitize,
        [
          rehypeExternalLinks,
          { target: "_blank", rel: ["noopener", "noreferrer", "nofollow"] },
        ],
        [addClasses, { "h2,h3,h4,h5,h6": "snap-start scroll-mt-20" }],
      ]}
      components={{}}>
      {children}
    </Markdown>
  );
}
