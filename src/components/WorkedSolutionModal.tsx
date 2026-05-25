import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronRight, ListChecks, X } from "lucide-react";
import { MarkdownArticle } from "./MarkdownArticle";

interface Step {
  title: string;
  explanation: string;
  check: string;
}

interface Props {
  open: boolean;
  sourceContent: string;
  onClose: () => void;
}

export function WorkedSolutionModal({ open, sourceContent, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [final, setFinal] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  const [checked, setChecked] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open) return;
    setSteps([]);
    setProblem("");
    setFinal("");
    setExpanded(new Set([0]));
    setChecked(new Set());
    setLoading(true);
    (async () => {
      try {
        const resp = await fetch("/api/worked-solution", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: sourceContent }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error ?? "Failed");
        if (!Array.isArray(data.steps) || data.steps.length === 0) {
          toast.error("Could not derive a worked solution from this answer.");
          onClose();
          return;
        }
        setProblem(data.problem ?? "");
        setSteps(data.steps);
        setFinal(data.final ?? "");
      } catch (e) {
        toast.error((e as Error).message);
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [open, sourceContent, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const toggleStep = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const toggleCheck = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  if (!open) return null;

  const allChecked = steps.length > 0 && checked.size === steps.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cosmic-black/85 backdrop-blur-sm">
      <div className="relative mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-cosmic-pulse/30 bg-cosmic-void/95 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <ListChecks className="h-4 w-4 text-cosmic-pulse" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-cosmic-pulse">
                Worked Solution
              </div>
              <div className="font-serif text-sm italic text-muted-foreground">
                {loading
                  ? "Decomposing into atomic steps…"
                  : `${checked.size} / ${steps.length} steps checked`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-cosmic-deep/40 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading && (
            <div className="space-y-4 py-12">
              <div className="h-3 w-2/3 animate-pulse rounded bg-cosmic-deep/50" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-cosmic-deep/50" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-cosmic-deep/50" />
              <div className="h-3 w-2/5 animate-pulse rounded bg-cosmic-deep/50" />
            </div>
          )}

          {!loading && steps.length > 0 && (
            <>
              {problem && (
                <div className="mb-6 rounded-lg border border-border/60 bg-cosmic-black/40 p-4">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                    The Problem
                  </div>
                  <p className="font-serif text-lg italic leading-snug text-foreground">
                    {problem}
                  </p>
                </div>
              )}

              <ol className="space-y-3">
                {steps.map((s, i) => {
                  const isOpen = expanded.has(i);
                  const isChecked = checked.has(i);
                  return (
                    <li
                      key={i}
                      className={`overflow-hidden rounded-xl border transition-colors ${
                        isChecked
                          ? "border-emerald-400/40 bg-emerald-400/5"
                          : "border-border bg-cosmic-deep/15"
                      }`}
                    >
                      <button
                        onClick={() => toggleStep(i)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-cosmic-deep/30"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCheck(i);
                          }}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                            isChecked
                              ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-200"
                              : "border-border hover:border-cosmic-pulse/60"
                          }`}
                          aria-label="Mark step understood"
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </button>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cosmic-pulse/40 text-[10px] font-bold text-cosmic-pulse">
                          {i + 1}
                        </span>
                        <span className="flex-1 font-serif text-base text-foreground">
                          {s.title}
                        </span>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="border-t border-border/40 px-4 pb-4 pt-3 pl-14">
                          <MarkdownArticle content={s.explanation} />
                          {s.check && (
                            <div className="mt-4 rounded-md border border-cosmic-pulse/25 bg-cosmic-black/40 px-3 py-2">
                              <div className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-cosmic-pulse">
                                Self-check
                              </div>
                              <p className="font-serif text-sm italic text-foreground/90">
                                {s.check}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>

              {final && (
                <div className="mt-6 rounded-lg border border-cosmic-pulse/40 bg-cosmic-deep/20 p-4">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-cosmic-pulse">
                    Final Result
                  </div>
                  <MarkdownArticle content={final} />
                </div>
              )}

              {allChecked && (
                <div className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-center text-sm text-emerald-200">
                  Every step checked off. The mechanism is yours.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
