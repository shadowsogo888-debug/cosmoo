import { MODES, DISCIPLINES, type ModeId, type Discipline } from "@/lib/cosmos";

interface Props {
  mode: ModeId;
  discipline: Discipline;
  onModeChange: (m: ModeId) => void;
  onDisciplineChange: (d: Discipline) => void;
}

export function ModeBar({ mode, discipline, onModeChange, onDisciplineChange }: Props) {
  return (
    <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-3 px-6 pt-4 md:px-12">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Mode
        </span>
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-cosmic-void/50 p-1">
          {MODES.map((m) => {
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                title={m.hint}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-cosmic-pulse text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Focus
        </span>
        <select
          value={discipline}
          onChange={(e) => onDisciplineChange(e.target.value as Discipline)}
          className="rounded-md border border-border bg-cosmic-void px-3 py-1.5 text-xs font-medium text-foreground focus:border-cosmic-pulse focus:outline-none"
        >
          {DISCIPLINES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
