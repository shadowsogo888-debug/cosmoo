import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { MarkdownArticle } from "./MarkdownArticle";

interface Card {
  q: string;
  a: string;
}

interface Props {
  open: boolean;
  sourceContent: string;
  onClose: () => void;
}

export function FlashcardsModal({ open, sourceContent, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open) return;
    setCards([]);
    setIndex(0);
    setFlipped(false);
    setMastered(new Set());
    setLoading(true);
    (async () => {
      try {
        const resp = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: sourceContent }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error ?? "Failed");
        if (!Array.isArray(data.cards) || data.cards.length === 0) {
          toast.error("No cards could be generated from this answer.");
          onClose();
          return;
        }
        setCards(data.cards);
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
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key.toLowerCase() === "m") toggleMaster();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const next = () => {
    setFlipped(false);
    setIndex((i) => (cards.length ? (i + 1) % cards.length : 0));
  };
  const prev = () => {
    setFlipped(false);
    setIndex((i) => (cards.length ? (i - 1 + cards.length) % cards.length : 0));
  };
  const toggleMaster = () => {
    setMastered((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (!open) return null;

  const card = cards[index];
  const isMastered = mastered.has(index);
  const allMastered = cards.length > 0 && mastered.size === cards.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cosmic-black/85 backdrop-blur-sm">
      <div className="relative mx-4 flex w-full max-w-3xl flex-col rounded-2xl border border-cosmic-pulse/30 bg-cosmic-void/95 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-cosmic-pulse" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-cosmic-pulse">
                Flashcards
              </div>
              <div className="font-serif text-sm italic text-muted-foreground">
                {loading
                  ? "Distilling cards from your answer…"
                  : `${mastered.size} / ${cards.length} mastered`}
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
        <div className="p-6 md:p-10">
          {loading && (
            <div className="space-y-4 py-12">
              <div className="h-3 w-2/3 animate-pulse rounded bg-cosmic-deep/50" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-cosmic-deep/50" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-cosmic-deep/50" />
            </div>
          )}

          {!loading && card && (
            <>
              <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                <span>
                  Card {index + 1} of {cards.length}
                </span>
                <span>{flipped ? "Answer" : "Question"}</span>
              </div>

              <button
                onClick={() => setFlipped((f) => !f)}
                className={`group relative flex min-h-70 w-full items-center justify-center overflow-hidden rounded-xl border px-6 py-8 text-left transition-all ${
                  isMastered
                    ? "border-emerald-400/40 bg-emerald-400/5"
                    : "border-cosmic-pulse/30 bg-cosmic-deep/20 hover:border-cosmic-pulse/60"
                }`}
              >
                <div className="absolute right-3 top-3 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 transition-opacity group-hover:opacity-100">
                  Click or [Space] to flip
                </div>
                <div className="w-full max-w-2xl">
                  {flipped ? (
                    <MarkdownArticle content={card.a} />
                  ) : (
                    <p className="text-center font-serif text-2xl italic leading-snug text-foreground">
                      {card.q}
                    </p>
                  )}
                </div>
              </button>

              {allMastered && (
                <div className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-center text-sm text-emerald-200">
                  All cards mastered. Stellar work.
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        {!loading && cards.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-cosmic-black/40 px-6 py-4">
            <button
              onClick={prev}
              className="flex items-center gap-1.5 rounded-md border border-border bg-cosmic-void/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3 w-3" /> Prev
            </button>

            <button
              onClick={toggleMaster}
              className={`flex items-center gap-1.5 rounded-md border px-4 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                isMastered
                  ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                  : "border-border bg-cosmic-void/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Check className="h-3 w-3" />
              {isMastered ? "Mastered" : "Mark Mastered"}
            </button>

            <button
              onClick={next}
              className="flex items-center gap-1.5 rounded-md border border-border bg-cosmic-void/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Next <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
