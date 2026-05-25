import { Plus, Trash2 } from "lucide-react";
import type { Thread } from "@/hooks/useChat";

interface Props {
  threads: Thread[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export function SidebarNav({ threads, activeId, onSelect, onCreate, onDelete }: Props) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-cosmic-black">
      <div className="p-8">
        <h1 className="font-serif text-2xl italic tracking-tight text-foreground">
          Cosmos &amp; <span className="text-cosmic-pulse">Crucible</span>
        </h1>
        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Observatory Intelligence
        </p>
      </div>

      <div className="px-4">
        <button
          onClick={onCreate}
          className="group flex w-full items-center justify-between rounded-md border border-border bg-cosmic-void/60 px-4 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:border-cosmic-pulse/40 hover:bg-cosmic-void hover:text-foreground"
        >
          <span>New Enquiry</span>
          <Plus className="h-3.5 w-3.5 text-cosmic-pulse" />
        </button>
      </div>

      <nav className="mt-8 flex-1 space-y-8 overflow-y-auto px-4 pb-8">
        <section>
          <h3 className="mb-4 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Recent Enquiries
          </h3>
          <div className="space-y-1">
            {threads.map((t) => {
              const active = t.id === activeId;
              return (
                <div
                  key={t.id}
                  className={`group flex items-center rounded-md ${
                    active
                      ? "border-l-2 border-cosmic-pulse bg-white/5"
                      : "border-l-2 border-transparent hover:bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => onSelect(t.id)}
                    className={`flex-1 truncate px-4 py-2 text-left text-sm transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.title}
                  </button>
                  <button
                    onClick={() => onDelete(t.id)}
                    className="mr-2 rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-white/5 hover:text-foreground group-hover:opacity-100"
                    aria-label="Delete enquiry"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="mb-4 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Disciplines
          </h3>
          <div className="space-y-1 px-4 text-sm">
            {["Physics", "Chemistry", "Biology", "Geology", "Astronomy"].map((d) => (
              <div key={d} className="py-1 font-serif text-base italic text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
        </section>
      </nav>

      <div className="border-t border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-tr from-cosmic-pulse to-cosmic-deep text-[10px] font-bold text-foreground">
            C&amp;C
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Principal Investigator</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Session · Ephemeral
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
