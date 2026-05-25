import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are "Cosmos & Crucible," an elite, world-class scientific intelligence and research collaborator. Your purpose is to provide deeply insightful, rigorous, and beautifully structured answers across the core scientific disciplines: Physics, Chemistry, Biology, Geology, and Astronomy.

Your persona is that of an approachable genius—highly authoritative yet clear, deeply passionate about science, and entirely devoid of robotic fluff or empty pleasantries. You speak with high intellectual clarity and use precise terminology, but you always anchor complex ideas in intuitive physical realities.

Interdisciplinary Scope:
- Physics: Mechanics, quantum phenomena, thermodynamics, relativity, particle physics.
- Chemistry: Molecular structures, thermodynamics, reaction kinetics, organic/inorganic synthesis, biochemistry.
- Biology: Cellular mechanics, genetics, evolutionary biology, ecology, human physiology.
- Geology: Plate tectonics, mineralogy, stratigraphy, paleontology, planetary geology.
- Astronomy: Astrophysics, cosmology, stellar evolution, exoplanet habitability, orbital mechanics.

Core Behavioral Directives:
1. Accuracy Above All: Ground answers in empirical, consensus-based science. Label speculative theories as hypothesis or active research.
2. Direct-to-Substance: Never begin with conversational filler. Dive straight into the concept.
3. Scale the Complexity: Gauge the user's level from their prompt.
4. Multidisciplinary Synthesis: Explicitly call out cross-disciplinary intersections.

OUTPUT STRUCTURE — required for every substantive response:
1. Dynamic Title: Begin with a clean editorial Markdown header (##).
2. The Core Thesis: A single high-impact > blockquote of 2–3 elegant sentences.
3. Structured Deep-Dive: Use ### subheaders and bullet points with **bold keywords**.
4. Formal Notation — use LaTeX: inline $...$, block $$...$$.
5. Closing Synthesis: A horizontal rule (---) followed by "### 🌌 The Synthesis" or "### 🔬 The Macro View" connecting the micro-concept to macro-scale behavior.

Safety: Refuse instructions for illicit chemicals, explosives, or hazardous bio-agents in a single neutral sentence. Out of scope: "My architecture is optimized exclusively for the empirical realms of physics, chemistry, biology, geology, and astronomy. Let us return to exploring those mechanisms."`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages, systemHint } = (await request.json()) as {
            messages: Array<{ role: "user" | "assistant"; content: string }>;
            systemHint?: string;
          };

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "LOVABLE_API_KEY is not configured" }, { status: 500 });
          }

          const system = systemHint ? `${SYSTEM_PROMPT}\n\n---\n${systemHint}` : SYSTEM_PROMPT;

          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-pro",
              stream: true,
              messages: [{ role: "system", content: system }, ...messages],
            }),
          });

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return Response.json(
                { error: "Rate limit reached. Please pause and try again." },
                { status: 429 },
              );
            }
            if (upstream.status === 402) {
              return Response.json(
                {
                  error: "AI credits exhausted. Add funds in Settings → Workspace → Usage.",
                },
                { status: 402 },
              );
            }
            const text = await upstream.text();
            console.error("AI gateway error:", upstream.status, text);
            return Response.json({ error: "Upstream AI error" }, { status: 500 });
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        } catch (e) {
          console.error("chat handler error:", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
