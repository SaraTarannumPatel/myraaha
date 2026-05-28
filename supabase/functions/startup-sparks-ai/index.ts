import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAuthUser, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const user = await getAuthUser(req);
  if (!user) return unauthorized();

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
    } else if (type === "guided_exploration") {
      messages = [
        { role: "system", content: `You are MyRaaha's Startup Sparks exploration guide. Based on a user's answers to discovery questions, generate personalized entrepreneurial insights. Be warm, encouraging, and specific. Use Gen Z–friendly language.

User context:
- Name: ${data.name || "Explorer"}
- Problems they want to solve: ${data.problemTypes || "not specified"}
- Skills/interests: ${data.skillsInterests || "not specified"}
- Startup type that excites them: ${data.startupType || "not specified"}
- Past interactions: ${data.likedSectors?.join(", ") || "none yet"}` },
        { role: "user", content: "Based on my answers, give me personalized entrepreneurial exploration suggestions." }
      ];
    } else if (type === "resource_suggestions") {
      messages = [
        { role: "system", content: "You are a startup learning advisor. Suggest learning resources and next steps based on the user's exploration patterns." },
        { role: "user", content: `This user has explored these sectors: ${data.sectors?.join(", ") || "various"}. They liked these ideas: ${data.likedIdeas?.join(", ") || "none yet"}. They spotted these problems: ${data.problems?.join(", ") || "none yet"}. Suggest 4 specific learning topics and why each matters for their entrepreneurial journey.` }
      ];
    } else if (type === "action_prompts") {
      messages = [
        { role: "system", content: "You are a startup action coach. Based on user's exploration data, suggest concrete small experiments they can start right now." },
        { role: "user", content: `User has ${data.ideasCount || 0} ideas, liked ${data.likedCount || 0} idea cards, spotted ${data.problemsCount || 0} problems, and completed ${data.questsCount || 0} quests. Their top sectors: ${data.topSectors?.join(", ") || "general"}. Suggest 3 small, actionable experiments they can start this week.` }
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
                category: { type: "string" },
                scale: { type: "string", enum: ["local", "regional", "national", "global"] },
                feasibility: { type: "string", enum: ["low", "medium", "high"] },
                relevance_score: { type: "number" },
                affected_groups: { type: "array", items: { type: "string" } },
                potential_approaches: { type: "array", items: { type: "string" } },
                encouragement: { type: "string" }
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
                score: { type: "number" },
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
      },
      guided_exploration: {
        tools: [{
          type: "function",
          function: {
            name: "exploration_insights",
            description: "Return personalized exploration insights and suggestions",
            parameters: {
              type: "object",
              properties: {
                founder_traits: { type: "array", items: { type: "string" }, description: "3-4 emerging founder traits detected" },
                suggested_sectors: { type: "array", items: { type: "string" }, description: "2-3 sectors that match their profile" },
                next_steps: { type: "array", items: { type: "string" }, description: "3 actionable next steps" },
                encouragement: { type: "string" },
                mindset_tip: { type: "string" }
              },
              required: ["founder_traits", "suggested_sectors", "next_steps", "encouragement", "mindset_tip"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "exploration_insights" } }
      },
      resource_suggestions: {
        tools: [{
          type: "function",
          function: {
            name: "suggest_resources",
            description: "Return personalized learning resource suggestions",
            parameters: {
              type: "object",
              properties: {
                topics: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      why_it_matters: { type: "string" },
                      category: { type: "string" },
                      difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] }
                    },
                    required: ["title", "why_it_matters", "category", "difficulty"],
                    additionalProperties: false
                  }
                },
                encouragement: { type: "string" }
              },
              required: ["topics", "encouragement"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "suggest_resources" } }
      },
      action_prompts: {
        tools: [{
          type: "function",
          function: {
            name: "suggest_actions",
            description: "Return 3 actionable experiments",
            parameters: {
              type: "object",
              properties: {
                experiments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      time_needed: { type: "string" },
                      module_link: { type: "string", description: "mvp-builder, startup-lab, mindset-builder, or startup-communities" }
                    },
                    required: ["title", "description", "time_needed", "module_link"],
                    additionalProperties: false
                  }
                },
                encouragement: { type: "string" }
              },
              required: ["experiments", "encouragement"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "suggest_actions" } }
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
