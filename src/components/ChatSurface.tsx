import { useEffect, useRef } from "react";
import type { Message } from "@/hooks/useChat";
import { MarkdownArticle } from "./MarkdownArticle";
import { StarterPrompts } from "./StarterPrompts";
import { MessageActions } from "./MessageActions";

interface Props {
  messages: Message[];
  isStreaming: boolean;
  onPickStarter: (q: string) => void;
  onRegenerate: () => void;
}

const DISCIPLINES = ["Physics", "Chemistry", "Biology", "Geology", "Astronomy"];

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <div className="mb-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-cosmic-pulse">
        <span className="h-px w-8 bg-cosmic-pulse" />
        Observatory Intake
        <span className="h-px w-8 bg-cosmic-pulse" />
      </div>
      <h2 className="font-serif text-5xl leading-tight text-foreground md:text-6xl">
        Intelligence tailored for the{" "}
        <span className="italic text-cosmic-pulse">scientific frontier.</span>
      </h2>
      <p className="mt-6 font-serif text-xl italic leading-relaxed text-muted-foreground">
        Pose a question across physics, chemistry, biology, geology, or astronomy. Each response is
        composed as a structured editorial — thesis, derivation, synthesis.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {DISCIPLINES.map((d) => (
          <span
            key={d}
            className="rounded-full border border-border bg-cosmic-void/60 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="mt-10 text-left">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Or begin with a curated enquiry
        </div>
        <StarterPrompts onPick={onPick} />
      </div>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-xl rounded-xl border border-cosmic-pulse/30 bg-cosmic-deep/25 px-6 py-5 shadow-lg">
        <p className="font-serif text-base italic leading-relaxed text-foreground/90">{content}</p>
      </div>
    </div>
  );
}

function AssistantMessage({
  content,
  streaming,
  onRegenerate,
  isLast,
}: {
  content: string;
  streaming: boolean;
  onRegenerate: () => void;
  isLast: boolean;
}) {
  if (!content && streaming) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-cosmic-pulse">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cosmic-pulse" />
          Composing response
        </div>
        <div className="h-3 w-2/3 animate-pulse rounded bg-cosmic-void" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-cosmic-void" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-cosmic-void" />
      </div>
    );
  }
  return (
    <article>
      <MarkdownArticle content={content} />
      {streaming && (
        <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-cosmic-pulse align-middle" />
      )}
      {!streaming && content && (
        <MessageActions content={content} onRegenerate={onRegenerate} canRegenerate={isLast} />
      )}
    </article>
  );
}

export function ChatSurface({ messages, isStreaming, onPickStarter, onRegenerate }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-12 md:py-16">
        {messages.length === 0 ? (
          <EmptyState onPick={onPickStarter} />
        ) : (
          <div className="space-y-16">
            {messages.map((m, i) => {
              const last = i === messages.length - 1;
              return (
                <div key={m.id}>
                  {m.role === "user" ? (
                    <UserMessage content={m.content} />
                  ) : (
                    <AssistantMessage
                      content={m.content}
                      streaming={last && isStreaming}
                      onRegenerate={onRegenerate}
                      isLast={last && !isStreaming}
                    />
                  )}
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>
    </div>
  );
}
