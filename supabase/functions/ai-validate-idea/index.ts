import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { idea } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a startup idea validator. Analyze the idea and return structured feedback using the provided tool."
          },
          {
            role: "user",
            content: `Validate this startup idea:\nTitle: ${idea.title}\nProblem: ${idea.problem_statement || "Not specified"}\nSolution: ${idea.solution || "Not specified"}\nTarget Audience: ${idea.target_audience || "Not specified"}\nCategory: ${idea.category || "Not specified"}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "validate_idea",
            description: "Return structured validation of a startup idea",
            parameters: {
              type: "object",
              properties: {
                score: { type: "number", description: "Validation score 0.0 to 1.0" },
                strengths: { type: "array", items: { type: "string" }, description: "3 key strengths" },
                weaknesses: { type: "array", items: { type: "string" }, description: "3 areas to improve" },
                next_steps: { type: "array", items: { type: "string" }, description: "3 actionable next steps" },
                market_fit: { type: "string", description: "Brief market fit assessment" }
              },
              required: ["score", "strengths", "weaknesses", "next_steps", "market_fit"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "validate_idea" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const validation = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(validation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to parse validation" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("validate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
