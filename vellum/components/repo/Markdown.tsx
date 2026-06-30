"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/repo/CodeBlock";

// Renders GitHub-flavored Markdown, styled to the Vellum theme tokens via the
// `.md` CSS block in globals.css. Fenced code blocks are syntax-highlighted
// (Prism) with a language label; inline code stays a simple styled chip. Links
// open in a new tab.
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          // Flatten <pre>; CodeBlock supplies its own container.
          pre: ({ children }) => <>{children}</>,
          code({ className, children, ...props }) {
            const text = String(children ?? "");
            const match = /language-(\w[\w+#-]*)/.exec(className ?? "");
            const isBlock = Boolean(match) || text.includes("\n");
            if (!isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            const lang = match?.[1] ?? "text";
            return (
              <figure className="md-code">
                <figcaption className="md-code-lang">{lang}</figcaption>
                <CodeBlock code={text} language={lang} />
              </figure>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
