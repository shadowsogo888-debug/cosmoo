import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface Props {
  content: string;
}

export function MarkdownArticle({ content }: Props) {
  return (
    <div className="cc-article font-sans text-[15px] leading-relaxed text-foreground/85">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h2 className="font-serif text-4xl leading-tight text-foreground md:text-5xl">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 className="mt-2 font-serif text-4xl leading-tight text-foreground md:text-5xl">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-10 mb-3 font-serif text-2xl font-semibold text-foreground">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-8 mb-2 font-sans text-xs font-bold uppercase tracking-[0.2em] text-cosmic-pulse">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-4 text-[15px] leading-[1.75] text-foreground/80">{children}</p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-8 border-l-2 border-cosmic-pulse pl-6 font-serif text-xl italic leading-relaxed text-foreground/90 md:text-2xl">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-10 border-border/60" />,
          ul: ({ children }) => <ul className="my-5 space-y-3 pl-1">{children}</ul>,
          ol: ({ children }) => (
            <ol className="my-5 list-decimal space-y-3 pl-6 marker:text-cosmic-pulse">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="relative pl-5 text-foreground/80 before:absolute before:left-0 before:top-[0.65em] before:h-1 before:w-1 before:rounded-full before:bg-cosmic-pulse">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-cosmic-pulse underline-offset-4 hover:underline"
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="rounded bg-cosmic-void px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="font-mono text-sm text-foreground" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto rounded-md border border-border bg-cosmic-void p-5 font-mono text-sm leading-relaxed">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border bg-cosmic-void px-4 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border/50 px-4 py-2 text-foreground/80">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
