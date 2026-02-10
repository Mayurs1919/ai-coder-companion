import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service not configured");

    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { resume_id, action = "analyze", job_description } = await req.json();

    if (!resume_id) {
      return new Response(JSON.stringify({ error: "resume_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get resume record
    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resume_id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !resume) {
      return new Response(JSON.stringify({ error: "Resume not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download file content
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(resume.storage_path);

    if (downloadError || !fileData) {
      return new Response(JSON.stringify({ error: "Failed to retrieve resume file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let resumeText = "";
    if (resume.file_type === "txt") {
      resumeText = await fileData.text();
    } else {
      // For PDF/DOCX, send raw text extraction prompt
      const bytes = new Uint8Array(await fileData.arrayBuffer());
      const textDecoder = new TextDecoder("utf-8", { fatal: false });
      resumeText = textDecoder.decode(bytes).replace(/[^\x20-\x7E\n\r\t]/g, " ").substring(0, 8000);
    }

    // Update status
    await supabase.from("resumes").update({ status: "parsing" }).eq("id", resume_id);

    // Build AI prompt based on action
    let systemPrompt = "";
    let userPrompt = "";

    if (action === "analyze") {
      systemPrompt = `You are a Resume Intelligence Agent. Parse the resume and extract structured information.
OUTPUT FORMAT (JSON only, no other text):
{
  "name": "candidate name",
  "email": "email if found",
  "phone": "phone if found",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [{"title": "", "company": "", "duration": "", "highlights": [""]}],
  "education": [{"degree": "", "institution": "", "year": ""}],
  "certifications": [""],
  "languages": [""],
  "overall_score": 0-100,
  "strengths": [""],
  "improvements": [""]
}`;
      userPrompt = `Parse and analyze this resume:\n\n${resumeText}`;
    } else if (action === "match") {
      systemPrompt = `You are a Resume Matching Agent. Compare the resume against the job description and produce a matching report.
OUTPUT FORMAT (JSON only, no other text):
{
  "match_score": 0-100,
  "matching_skills": [""],
  "missing_skills": [""],
  "experience_match": "strong|moderate|weak",
  "education_match": "strong|moderate|weak",
  "recommendation": "strong_fit|good_fit|partial_fit|poor_fit",
  "explanation": "2-3 sentences explaining the match",
  "suggestions": ["actionable improvement suggestions"]
}`;
      userPrompt = `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${job_description || "General software engineering role"}`;
    } else if (action === "score") {
      systemPrompt = `You are a Resume Scoring Agent. Evaluate the resume quality and provide a detailed score.
OUTPUT FORMAT (JSON only, no other text):
{
  "overall_score": 0-100,
  "categories": {
    "content": {"score": 0-100, "feedback": ""},
    "formatting": {"score": 0-100, "feedback": ""},
    "keywords": {"score": 0-100, "feedback": ""},
    "experience_depth": {"score": 0-100, "feedback": ""},
    "education": {"score": 0-100, "feedback": ""}
  },
  "top_strengths": [""],
  "critical_improvements": [""],
  "ats_friendly": true
}`;
      userPrompt = `Score this resume:\n\n${resumeText}`;
    }

    // Call AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawOutput = aiData.choices?.[0]?.message?.content || "{}";

    // Try to parse JSON from response
    let parsedResult: Record<string, unknown>;
    try {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      parsedResult = JSON.parse(jsonMatch ? jsonMatch[0] : rawOutput);
    } catch {
      parsedResult = { raw_output: rawOutput };
    }

    // Update resume record
    const updateData: Record<string, unknown> = { status: action === "analyze" ? "parsed" : "analyzed" };
    if (action === "analyze") {
      updateData.parsed_data = parsedResult;
    } else {
      updateData.analysis_result = parsedResult;
    }

    await supabase.from("resumes").update(updateData).eq("id", resume_id);

    return new Response(
      JSON.stringify({
        resume_id,
        action,
        result: parsedResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Resume analyze error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
