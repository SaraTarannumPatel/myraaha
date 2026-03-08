import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, context } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing API key");

    const systemPrompts: Record<string, string> = {
      next_steps: `You are a startup advisor. Given a project's details, feedback received, and engagement metrics, provide 5-7 personalized next steps. Each step should have: title, description, priority (high/medium/low), category (product/marketing/funding/team/learning). Return JSON: { "next_steps": [...] }`,
      
      funding_navigator: `You are a startup funding expert. Given the startup's stage, metrics, and profile, recommend funding paths. Include: bootstrapping strategies, grant opportunities, investor readiness assessment, crowdfunding viability. Return JSON: { "readiness_score": 0-100, "recommended_paths": [{ "type": string, "description": string, "fit_score": 0-100, "action_items": string[] }], "preparation_tips": string[] }`,
      
      collaboration_match: `You are a team-building advisor. Given a project's needs and available user skills, suggest ideal collaboration roles and skill matches. Return JSON: { "needed_roles": [{ "role": string, "skills_needed": string[], "priority": string }], "collaboration_tips": string[] }`,
      
      showcase_feedback: `You are a startup mentor. Given a project showcase post, provide constructive feedback covering: strengths, areas for improvement, market positioning, and suggested experiments. Return JSON: { "strengths": string[], "improvements": string[], "market_insights": string[], "suggested_experiments": string[], "overall_score": 0-100 }`,
      
      launch_checklist: `You are a go-to-market strategist. Given the startup's details, create a comprehensive launch checklist. Return JSON: { "phases": [{ "name": string, "tasks": [{ "task": string, "category": string, "priority": string, "estimated_days": number }] }], "launch_tips": string[] }`,
      
      industry_deck: `You are a business development advisor. Given the startup's profile, create collaboration deck suggestions for industry partnerships. Return JSON: { "partnership_opportunities": [{ "type": string, "description": string, "value_proposition": string, "approach_strategy": string }], "deck_outline": string[], "networking_tips": string[] }`,
    };

    const systemPrompt = systemPrompts[type];
    if (!systemPrompt) throw new Error(`Unknown type: ${type}`);

    const res = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(context) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
