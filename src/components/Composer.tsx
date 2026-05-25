import { useEffect, useRef, useState } from "react";
import { Square } from "lucide-react";

interface Props {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function Composer({ onSend, onStop, isStreaming }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [value]);

  const submit = () => {
    if (!value.trim() || isStreaming) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="px-6 pb-8 pt-4 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="group relative">
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-linear-to-r from-cosmic-pulse/30 via-cosmic-deep/20 to-cosmic-pulse/30 opacity-30 blur transition duration-700 group-focus-within:opacity-80" />
          <div className="relative rounded-xl border border-border bg-cosmic-void/95 p-4 shadow-2xl backdrop-blur">
            <textarea
              ref={ref}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Inquire about the nature of the cosmos…"
              rows={1}
              className="block w-full resize-none border-0 bg-transparent font-serif text-lg italic text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            />
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <div className="flex gap-5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                <span>Cmd · Enter to Submit</span>
              </div>
              {isStreaming ? (
                <button
                  onClick={onStop}
                  className="flex items-center gap-2 rounded-lg border border-border bg-cosmic-black px-5 py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:border-cosmic-pulse/50"
                >
                  <Square className="h-3 w-3 fill-current" /> Halt
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={!value.trim()}
                  className="rounded-lg bg-cosmic-pulse px-6 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg shadow-cosmic-pulse/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Execute Analysis
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Cosmos &amp; Crucible · v1.0 · Ephemeral Session
        </p>
      </div>
    </div>
  );
}
