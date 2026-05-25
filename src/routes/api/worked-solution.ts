import { createFileRoute } from "@tanstack/react-router";

const WORKED_PROMPT = `You are a scientific tutor producing a step-by-step worked solution.

Given a study passage (which may contain a question, a derivation, or an explanation), produce an ordered sequence of 4 to 8 atomic solution steps. Each step is one logical move (set up a variable, apply a law, simplify, substitute, interpret).

For every step provide:
- "title": short imperative label (max 7 words).
- "explanation": 2–4 sentences explaining WHY this step works. Use inline LaTeX with $...$ for symbols and block $$...$$ for full equations when helpful.
- "check": a one-line self-check question the student should be able to answer after this step (no answer given).

OUTPUT FORMAT — return ONLY raw JSON, no markdown fences:
{"problem":"restated problem in one sentence","steps":[{"title":"...","explanation":"...","check":"..."}, ...],"final":"final result or key conclusion, with LaTeX if applicable"}`;

export const Route = createFileRoute("/api/worked-solution")({
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
              model: "google/gemini-2.5-pro",
              messages: [
                { role: "system", content: WORKED_PROMPT },
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
          let parsed: {
            problem?: string;
            steps?: { title: string; explanation: string; check: string }[];
            final?: string;
          };
          try {
            parsed = JSON.parse(raw);
          } catch {
            const m = raw.match(/\{[\s\S]*\}/);
            parsed = m ? JSON.parse(m[0]) : {};
          }
          return Response.json({
            problem: parsed.problem ?? "",
            steps: parsed.steps ?? [],
            final: parsed.final ?? "",
          });
        } catch (e) {
          console.error("worked-solution handler error:", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
