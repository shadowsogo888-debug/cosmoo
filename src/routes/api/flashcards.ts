import { createFileRoute } from "@tanstack/react-router";

const FLASHCARD_PROMPT = `You are a flashcard generator for science students. Convert the supplied study passage into high-quality Q&A flashcards.

Rules:
- Produce 5 to 10 cards depending on density.
- Each "question" is a precise prompt (definition, derivation step, mechanism, formula recall, conceptual "why"). Avoid yes/no.
- Each "answer" is concise (1–3 sentences) and scientifically rigorous. Inline LaTeX with $...$ when notation matters.
- Vary cognitive level: recall, application, synthesis.
- Skip pleasantries, citations, or meta-commentary.

OUTPUT FORMAT — return ONLY raw JSON, no markdown fences, matching:
{"cards":[{"q":"...","a":"..."}, ...]}`;

export const Route = createFileRoute("/api/flashcards")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { content } = (await request.json()) as { content: string };
          if (!content || typeof content !== "string") {
            return Response.json({ error: "Missing content" }, { status: 400 });
          }

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "LOVABLE_API_KEY is not configured" }, { status: 500 });
          }

          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: FLASHCARD_PROMPT },
                { role: "user", content: content.slice(0, 12000) },
              ],
              response_format: { type: "json_object" },
            }),
          });

          if (!upstream.ok) {
            if (upstream.status === 429)
              return Response.json({ error: "Rate limit reached." }, { status: 429 });
            if (upstream.status === 402)
              return Response.json({ error: "AI credits exhausted." }, { status: 402 });
            return Response.json({ error: "Upstream AI error" }, { status: 500 });
          }

          const data = (await upstream.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const raw = data.choices?.[0]?.message?.content ?? "{}";
          let parsed: { cards?: { q: string; a: string }[] };
          try {
            parsed = JSON.parse(raw);
          } catch {
            const match = raw.match(/\{[\s\S]*\}/);
            parsed = match ? JSON.parse(match[0]) : { cards: [] };
          }

          return Response.json({ cards: parsed.cards ?? [] });
        } catch (e) {
          console.error("flashcards handler error:", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
