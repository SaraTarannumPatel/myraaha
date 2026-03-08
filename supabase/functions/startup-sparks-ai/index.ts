import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let messages: any[] = [];

    if (type === "analyze_problem") {
      messages = [
        { role: "system", content: "You are a startup problem analyst. Analyze the user's problem observation and return structured feedback using the provided tool." },
        { role: "user", content: `Analyze this problem observation from an aspiring entrepreneur:\n\n"${data.observation}"\n\nConsider: scale (local/regional/national/global), feasibility of solving it, market potential, and who is affected.` }
      ];
    } else if (type === "generate_ideas") {
      messages = [
        { role: "system", content: "You are a startup ideation expert. Generate fresh startup idea cards based on the user's interests and sector preference." },
        { role: "user", content: `Generate 3 startup idea prompts for someone interested in: ${data.interests || "general entrepreneurship"}. Sector focus: ${data.sector || "any"}. User type: ${data.userType || "beginner"}.` }
      ];
    } else if (type === "quest_feedback") {
      messages = [
        { role: "system", content: "You are a startup mentor reviewing a student's exploration quest response. Give encouraging, constructive feedback." },
        { role: "user", content: `Quest: "${data.questTitle}"\nDescription: "${data.questDescription}"\n\nUser's response:\n"${data.response}"\n\nProvide feedback on their thinking, highlight strengths, and suggest one area to explore deeper.` }
      ];
    }

    const toolDefs: Record<string, any> = {
      analyze_problem: {
        tools: [{
          type: "function",
          function: {
            name: "analyze_observation",
            description: "Return structured analysis of a problem observation",
            parameters: {
              type: "object",
              properties: {
                category: { type: "string", description: "Problem category: social_impact, tech_innovation, creative_industries, local_needs, emerging_trends" },
                scale: { type: "string", enum: ["local", "regional", "national", "global"] },
                feasibility: { type: "string", enum: ["low", "medium", "high"] },
                relevance_score: { type: "number", description: "0.0 to 1.0 relevance score" },
                affected_groups: { type: "array", items: { type: "string" }, description: "Groups affected by this problem" },
                potential_approaches: { type: "array", items: { type: "string" }, description: "3 potential approaches to solve this" },
                encouragement: { type: "string", description: "Encouraging message about their observation skills" }
              },
              required: ["category", "scale", "feasibility", "relevance_score", "affected_groups", "potential_approaches", "encouragement"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_observation" } }
      },
      generate_ideas: {
        tools: [{
          type: "function",
          function: {
            name: "generate_idea_cards",
            description: "Return 3 startup idea card prompts",
            parameters: {
              type: "object",
              properties: {
                ideas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      sector: { type: "string" },
                      difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                      tags: { type: "array", items: { type: "string" } }
                    },
                    required: ["title", "description", "sector", "difficulty", "tags"],
                    additionalProperties: false
                  }
                }
              },
              required: ["ideas"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_idea_cards" } }
      },
      quest_feedback: {
        tools: [{
          type: "function",
          function: {
            name: "provide_feedback",
            description: "Return structured feedback on quest response",
            parameters: {
              type: "object",
              properties: {
                score: { type: "number", description: "Quality score 0-100" },
                strengths: { type: "array", items: { type: "string" } },
                suggestions: { type: "array", items: { type: "string" } },
                encouragement: { type: "string" },
                next_quest_suggestion: { type: "string" }
              },
              required: ["score", "strengths", "suggestions", "encouragement"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "provide_feedback" } }
      }
    };

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages,
      ...toolDefs[type]
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      return new Response(toolCall.function.arguments, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("startup-sparks-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
