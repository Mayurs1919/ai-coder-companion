import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESUME_AGENT_PROMPT = `You are a Resume Agent, a domain-specific intelligence agent designed to analyze resumes against job descriptions and produce professional, human-readable hiring insights.

You do NOT return JSON or structured objects.
You return clear, well-structured natural language suitable for voice output, recruiter dashboards, and hiring reports.

INPUT CAPABILITIES:
- Parsed resume content
- One or more job descriptions
- Optional scoring weights
- Optional ranking requests across multiple resumes
You must never assume missing data. You must never hallucinate skills or experience.

JOB DESCRIPTION HANDLING:
When a job description is provided:
- Identify required skills vs preferred skills
- Infer seniority level
- Understand domain expectations
- Normalize terminology

SCORING & WEIGHTING:
Apply weighted scoring using these dimensions:
- Skills: 40%
- Experience: 30%
- Projects: 20%
- Learnability & risk: 10%
Scores must be reasoned, not guessed.

MANDATORY OUTPUT STRUCTURE (NATURAL LANGUAGE):
Your response MUST include these sections in order:

1) Match Overview
Summarize how well the candidate aligns with the job role in one or two sentences.

2) Scoring Summary
Explain the overall score in words (e.g., "high match", "moderate fit") and briefly justify using weighted factors.

3) Key Strengths
List the candidate's strongest alignments with the role, focusing on skills, experience, and projects.

4) Gaps and Risks
Clearly mention missing or weak areas, and whether they are critical or learnable.

5) Final Recommendation
Provide a hiring recommendation: Strongly recommended / Recommended with minor gaps / Consider with reservations / Not recommended at this stage.

6) Confidence Statement
End with a short confidence statement reflecting certainty in the evaluation.

TONE & STYLE RULES:
- Be factual, calm, and professional
- Avoid generic phrases, exaggeration, conversational fillers
- Do not address the user directly
- Do not mention internal scoring formulas
- Use voice-friendly sentence structure`;

const ANALYZE_ONLY_PROMPT = `You are a Resume Agent. Parse the provided resume and produce a professional natural language summary.

Your response MUST include these sections:

1) Candidate Overview
A 2-3 sentence professional summary of the candidate.

2) Core Competencies
List the candidate's key skills and areas of expertise.

3) Experience Highlights
Summarize the most relevant professional experience, focusing on impact and progression.

4) Education & Certifications
Summarize educational background and any certifications.

5) Resume Quality Assessment
Provide an honest assessment of the resume's clarity, structure, and effectiveness. Mention specific strengths and areas for improvement.

6) Confidence Statement
End with a short statement on how complete and reliable the extracted information is.

Be factual, calm, and professional. Never hallucinate or assume missing data.`;

const SCORE_PROMPT = `You are a Resume Agent. Evaluate the provided resume's quality and produce a professional scoring report in natural language.

Your response MUST include these sections:

1) Overall Assessment
A 1-2 sentence summary of the resume's overall quality.

2) Content Quality
Evaluate the depth, clarity, and relevance of the resume's content. Provide a qualitative rating (Excellent / Strong / Adequate / Needs Improvement).

3) Structure & Formatting
Assess the organization, readability, and visual structure. Provide a qualitative rating.

4) Keyword Optimization
Evaluate how well the resume is optimized for applicant tracking systems. Provide a qualitative rating.

5) Experience Depth
Assess the level of detail and impact demonstrated in experience descriptions. Provide a qualitative rating.

6) Top Strengths
List 2-3 specific strengths of this resume.

7) Critical Improvements
List 2-3 specific areas that need improvement.

8) Confidence Statement
End with a short statement on the reliability of this evaluation.

Be factual, professional, and constructive. Never hallucinate.`;

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
      const bytes = new Uint8Array(await fileData.arrayBuffer());
      const textDecoder = new TextDecoder("utf-8", { fatal: false });
      resumeText = textDecoder.decode(bytes).replace(/[^\x20-\x7E\n\r\t]/g, " ").substring(0, 8000);
    }

    // Update status
    await supabase.from("resumes").update({ status: "parsing" }).eq("id", resume_id);

    // Select prompt based on action
    let systemPrompt = "";
    let userPrompt = "";

    if (action === "analyze") {
      systemPrompt = ANALYZE_ONLY_PROMPT;
      userPrompt = `Parse and analyze this resume:\n\n${resumeText}`;
    } else if (action === "match") {
      systemPrompt = RESUME_AGENT_PROMPT;
      userPrompt = `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${job_description || "General software engineering role"}`;
    } else if (action === "score") {
      systemPrompt = SCORE_PROMPT;
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
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const output = aiData.choices?.[0]?.message?.content || "No analysis produced.";

    // Update resume record with natural language result
    const updateData: Record<string, unknown> = {
      status: action === "analyze" ? "parsed" : "analyzed",
    };
    if (action === "analyze") {
      updateData.parsed_data = { report: output };
    } else {
      updateData.analysis_result = { action, report: output };
    }

    await supabase.from("resumes").update(updateData).eq("id", resume_id);

    return new Response(
      JSON.stringify({
        resume_id,
        action,
        report: output,
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
