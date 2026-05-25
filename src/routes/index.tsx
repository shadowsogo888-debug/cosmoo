import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useChat } from "@/hooks/useChat";
import { SidebarNav } from "@/components/SidebarNav";
import { ChatSurface } from "@/components/ChatSurface";
import { Composer } from "@/components/Composer";
import { AtmosphereBackdrop } from "@/components/AtmosphereBackdrop";
import { ModeBar } from "@/components/ModeBar";
import { ReferenceDrawer } from "@/components/ReferenceDrawer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cosmos & Crucible — Scientific Intelligence" },
      {
        name: "description",
        content:
          "An editorial research collaborator for physics, chemistry, biology, geology, and astronomy. Every answer composed as a structured editorial.",
      },
      { property: "og:title", content: "Cosmos & Crucible" },
      {
        property: "og:description",
        content:
          "Elite scientific intelligence: rigorous answers, formal notation, multidisciplinary synthesis.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const {
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
  } = useChat();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="hidden md:block">
        <SidebarNav
          threads={threads}
          activeId={activeId}
          onSelect={selectThread}
          onCreate={createThread}
          onDelete={deleteThread}
        />
      </div>

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <AtmosphereBackdrop />

        <div className="relative z-10 flex items-center justify-between border-b border-border bg-cosmic-black/60 px-6 py-3 backdrop-blur md:px-12">
          <div className="flex items-center gap-3 md:hidden">
            <h1 className="font-serif text-xl italic">
              Cosmos &amp; <span className="text-cosmic-pulse">Crucible</span>
            </h1>
          </div>
          <div className="hidden md:block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {activeThread.messages.length === 0 ? "Awaiting Enquiry" : activeThread.title}
          </div>
          <div className="flex items-center gap-2">
            <ReferenceDrawer />
            <button
              onClick={createThread}
              className="rounded-md border border-border bg-cosmic-void/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground md:hidden"
            >
              New
            </button>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          <ModeBar
            mode={mode}
            discipline={discipline}
            onModeChange={setMode}
            onDisciplineChange={setDiscipline}
          />
          <ChatSurface
            messages={activeThread.messages}
            isStreaming={isStreaming}
            onPickStarter={sendMessage}
            onRegenerate={regenerate}
          />
          <Composer onSend={sendMessage} onStop={stop} isStreaming={isStreaming} />
        </div>
      </main>

      <Toaster theme="dark" position="top-center" richColors />
    </div>
  );
}
