// deno-lint-ignore-file
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are MedAssist, a knowledgeable medical assistant chatbot embedded in an emergency response app.

Your role:
- Give clear, calm, step-by-step guidance for common health questions AND emergency medical situations (CPR, choking, bleeding, burns, heart attack, stroke, seizures, allergic reactions, poisoning, fractures, unconscious person, childbirth emergencies, etc.).
- For any life-threatening emergency, IMMEDIATELY tell the user to call local emergency services (e.g. 911 / 112 / 108) FIRST, then provide first-aid steps while help arrives.
- Use short numbered steps for first-aid instructions. Bold critical actions.
- For common issues (fever, cold, headache, minor cuts, dehydration, indigestion), give practical home-care advice and clear signs of when to see a doctor.
- Always ask brief clarifying questions if the situation is unclear (age, symptoms, duration, allergies, medications).
- Never prescribe specific prescription drugs or dosages. Suggest OTC options generically when appropriate.
- End serious responses with a short disclaimer: "This is general guidance, not a diagnosis. Seek professional medical help."

Tone: warm, confident, urgent when needed, non-judgmental. Respond in the user's language.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (res.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: text }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(res.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
