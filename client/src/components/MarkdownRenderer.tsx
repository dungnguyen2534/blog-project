import Markdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownRendererProps {
  children: string;
}

export default function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <Markdown
      className="markdown"
      remarkPlugins={[remarkGfm, [remarkToc, { maxDepth: 3, tight: true }]]}
      rehypePlugins={[rehypeSlug, rehypeSanitize]}
      components={{}}>
      {children}
    </Markdown>
  );
}
