import { STARTERS } from "@/lib/cosmos";

interface Props {
  onPick: (q: string) => void;
}

export function StarterPrompts({ onPick }: Props) {
  return (
    <div className="mt-10 grid gap-3 sm:grid-cols-2">
      {STARTERS.map((s) => (
        <button
          key={s.q}
          onClick={() => onPick(s.q)}
          className="group rounded-xl border border-border bg-cosmic-void/40 p-5 text-left transition-all hover:border-cosmic-pulse/50 hover:bg-cosmic-void/80"
        >
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-cosmic-pulse">
            {s.discipline}
          </div>
          <p className="font-serif text-base italic leading-snug text-foreground/85 group-hover:text-foreground">
            {s.q}
          </p>
        </button>
      ))}
    </div>
  );
}
