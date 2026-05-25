import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CONSTANTS, EQUATIONS } from "@/lib/cosmos";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type Tab = "constants" | "equations";

function TeX({ src }: { src: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{ p: ({ children }) => <span>{children}</span> }}
    >
      {`$${src}$`}
    </ReactMarkdown>
  );
}

export function ReferenceDrawer() {
  const [tab, setTab] = useState<Tab>("constants");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 rounded-md border border-border bg-cosmic-void/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:border-cosmic-pulse/40 hover:text-foreground">
          <BookOpen className="h-3 w-3" /> Reference
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-md overflow-y-auto border-l border-border bg-cosmic-black p-0"
      >
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="font-serif text-2xl italic">Reference Almanac</SheetTitle>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Constants & key equations
          </p>
        </SheetHeader>

        <div className="flex gap-1 border-b border-border bg-cosmic-void/30 p-2">
          {(["constants", "equations"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                tab === t
                  ? "bg-cosmic-pulse text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "constants" && (
            <ul className="space-y-3">
              {CONSTANTS.map((c) => (
                <li
                  key={c.sym}
                  className="flex items-baseline justify-between gap-4 border-b border-border/50 pb-3"
                >
                  <div>
                    <div className="font-serif text-lg italic text-foreground">{c.sym}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {c.name}
                    </div>
                  </div>
                  <div className="font-mono text-sm text-foreground/90">{c.val}</div>
                </li>
              ))}
            </ul>
          )}

          {tab === "equations" && (
            <div className="space-y-6">
              {(["Physics", "Chemistry", "Biology", "Astronomy", "Geology"] as const).map(
                (domain) => {
                  const items = EQUATIONS.filter((e) => e.domain === domain);
                  if (!items.length) return null;
                  return (
                    <section key={domain}>
                      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-cosmic-pulse">
                        {domain}
                      </h3>
                      <ul className="space-y-3">
                        {items.map((e) => (
                          <li
                            key={e.name}
                            className="rounded-md border border-border bg-cosmic-void/50 p-3"
                          >
                            <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                              {e.name}
                            </div>
                            <div className="text-base text-foreground">
                              <TeX src={e.tex} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                },
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
