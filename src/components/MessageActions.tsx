import { useState } from "react";
import { Check, Copy, Layers, ListChecks, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { FlashcardsModal } from "./FlashcardsModal";
import { WorkedSolutionModal } from "./WorkedSolutionModal";

interface Props {
  content: string;
  onRegenerate?: () => void;
  canRegenerate: boolean;
}

export function MessageActions({ content, onRegenerate, canRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const [flashOpen, setFlashOpen] = useState(false);
  const [workedOpen, setWorkedOpen] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied as Markdown");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const btn =
    "flex items-center gap-1.5 rounded-md border border-border bg-cosmic-void/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:border-cosmic-pulse/40 hover:text-foreground";

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
        <button onClick={copy} className={btn}>
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy Markdown"}
        </button>
        <button onClick={() => setFlashOpen(true)} className={btn}>
          <Layers className="h-3 w-3" /> Flashcards
        </button>
        <button onClick={() => setWorkedOpen(true)} className={btn}>
          <ListChecks className="h-3 w-3" /> Worked Solution
        </button>
        {canRegenerate && onRegenerate && (
          <button onClick={onRegenerate} className={btn}>
            <RefreshCcw className="h-3 w-3" /> Regenerate
          </button>
        )}
      </div>
      <FlashcardsModal
        open={flashOpen}
        sourceContent={content}
        onClose={() => setFlashOpen(false)}
      />
      <WorkedSolutionModal
        open={workedOpen}
        sourceContent={content}
        onClose={() => setWorkedOpen(false)}
      />
    </>
  );
}
