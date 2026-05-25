import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { buildSystemHint, type Discipline, type ModeId } from "@/lib/cosmos";

export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const makeTitle = (text: string) => {
  const words = text.trim().split(/\s+/).slice(0, 7).join(" ");
  return words.length > 60 ? words.slice(0, 57) + "…" : words || "New enquiry";
};

const newThread = (): Thread => ({
  id: uid(),
  title: "New Enquiry",
  messages: [],
  createdAt: Date.now(),
});

export function useChat() {
  const [threads, setThreads] = useState<Thread[]>(() => [newThread()]);
  const [activeId, setActiveId] = useState<string>(() => threads[0].id);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<ModeId>("standard");
  const [discipline, setDiscipline] = useState<Discipline>("Auto");
  const abortRef = useRef<AbortController | null>(null);

  const activeThread = threads.find((t) => t.id === activeId) ?? threads[0];

  const createThread = useCallback(() => {
    const t = newThread();
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
  }, []);

  const selectThread = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteThread = useCallback(
    (id: string) => {
      setThreads((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (next.length === 0) {
          const fresh = newThread();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const runStream = useCallback(
    async (
      targetId: string,
      historyForApi: Array<{ role: Role; content: string }>,
      assistantMsgId: string,
    ) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      const appendDelta = (delta: string) => {
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id !== targetId) return t;
            const msgs = t.messages.slice();
            const last = msgs[msgs.length - 1];
            if (last && last.id === assistantMsgId) {
              msgs[msgs.length - 1] = { ...last, content: last.content + delta };
            }
            return { ...t, messages: msgs };
          }),
        );
      };

      try {
        const resp = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyForApi,
            systemHint: buildSystemHint(mode, discipline),
          }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          if (resp.status === 429) toast.error("Rate limit reached. Please pause and try again.");
          else if (resp.status === 402)
            toast.error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
          else toast.error("Failed to reach Cosmos & Crucible.");
          throw new Error("Stream init failed");
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          if (streamDone) break;
          buffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, nl);
            buffer = buffer.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (delta) appendDelta(delta);
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        if (buffer.trim()) {
          for (let raw of buffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (!raw.startsWith("data: ")) continue;
            const json = raw.slice(6).trim();
            if (json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) appendDelta(delta);
            } catch {
              /* ignore */
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error(err);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [mode, discipline],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: Message = { id: uid(), role: "user", content: trimmed };
      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: "",
      };

      const targetId = activeId;
      const baseMessages = activeThread.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setThreads((prev) =>
        prev.map((t) =>
          t.id !== targetId
            ? t
            : {
                ...t,
                title: t.messages.length === 0 ? makeTitle(trimmed) : t.title,
                messages: [...t.messages, userMsg, assistantMsg],
              },
        ),
      );

      await runStream(
        targetId,
        [...baseMessages, { role: "user", content: trimmed }],
        assistantMsg.id,
      );
    },
    [activeId, activeThread, isStreaming, runStream],
  );

  const regenerate = useCallback(async () => {
    if (isStreaming) return;
    const msgs = activeThread.messages;
    // Find last user message
    let lastUserIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) return;

    const truncated = msgs.slice(0, lastUserIdx + 1);
    const newAssistant: Message = {
      id: uid(),
      role: "assistant",
      content: "",
    };
    const targetId = activeId;

    setThreads((prev) =>
      prev.map((t) => (t.id !== targetId ? t : { ...t, messages: [...truncated, newAssistant] })),
    );

    await runStream(
      targetId,
      truncated.map((m) => ({ role: m.role, content: m.content })),
      newAssistant.id,
    );
  }, [activeId, activeThread, isStreaming, runStream]);

  return {
    threads,
    activeThread,
    activeId,
    isStreaming,
    mode,
    setMode,
    discipline,
    setDiscipline,
    sendMessage,
    regenerate,
    stop,
    createThread,
    selectThread,
    deleteThread,
  };
}
