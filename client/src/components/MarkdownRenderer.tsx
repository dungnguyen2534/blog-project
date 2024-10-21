"use client";

import Markdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import addClasses from "rehype-class-names";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

export default function MarkdownRenderer({
  children,
  className,
}: MarkdownRendererProps) {
  return (
    <Markdown
      className={`markdown max-w-full ${className}`}
      remarkPlugins={[
        remarkGfm,
        [remarkToc, { tight: true, prefix: "user-content-", maxDepth: 3 }],
      ]}
      rehypePlugins={[
        rehypeSlug,
        rehypeAutolinkHeadings,
        rehypeSanitize,
        [
          rehypeExternalLinks,
          { target: "_blank", rel: ["noopener", "noreferrer", "nofollow"] },
        ],
        [addClasses, { "h1,h2,h3,h4,h5,h6": "snap-start scroll-mt-20" }],
      ]}
      components={{
        img: (props) => (
          <span className="flex justify-center max-w-full m-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...props} className="rounded-md" alt={props.alt ?? ""} />
          </span>
        ),
        code: ({ className, children }) => {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <SyntaxHighlighter
              language={match[1]}
              showLineNumbers
              wrapLongLines
              style={vs2015}
              customStyle={{
                padding: "1rem",
                backgroundColor: "var(--markdown-pre)",
              }}>
              {String(children ?? " ").replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className={`${className} before:content-none after:content-none rounded-md p-1`}>
              {children}
            </code>
          );
        },
      }}>
      {children}
    </Markdown>
  );
}
