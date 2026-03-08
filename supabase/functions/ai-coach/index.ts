import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are ShuttlEx AI Coach — a warm, insightful entrepreneurship and career coach. You help users aged 13+ explore startup ideas, validate problems, build mindset, develop skills, and navigate their career-startup journey.

Context about the user:
- Name: ${context?.name || "Explorer"}
- Intent: ${context?.intent || "entrepreneurship"}
- User type: ${context?.userType || "unknown"}
- Industry interest: ${context?.industry || "not specified"}
- Career stage: ${context?.careerStage || "exploring"}
- Areas of focus: ${context?.areasOfFocus?.join(", ") || "not specified"}
- Goals: ${context?.goals || "not specified"}

Guidelines:
- Be encouraging, empathetic, and actionable
- Break complex topics into small, digestible steps
- Suggest relevant ShuttlEx tools: Startup Sparks (ideation), Mindset Builder (resilience), MVP Builder (prototyping), Path Selector (direction), Startup Lab (structured learning), Communities (networking)
- For career users, reference: Curiosity Compass, AI Roadmap, SelfGraph, Living Resume, Job Matching
- Ask reflective questions to deepen understanding
- Never be preachy or condescending
- Keep responses concise (3-5 paragraphs max)
- Use emojis sparingly for warmth`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
