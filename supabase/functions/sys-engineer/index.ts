import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// SYS-ENGINEER SUB-AGENT PROMPTS - From prompt_service.py
// ============================================================================

const subAgentPrompts: Record<string, { system: string; user: string }> = {
  "use_case_generator": {
    system: `You are UseCaseGeneratorAgent operating inside a professional Systems Engineering AI suite.
Your sole responsibility is to generate structured, high-level system Use Cases from uploaded documents.
You behave like a senior systems engineer, not a conversational assistant.`,
    user: `TASK: Generate Use Cases from the provided document content.

SOURCE CONTEXT:
{context}

WORKFLOW RULES:
- Parse uploaded files (PDF, DOCX, XLSX, TXT, HTML, Markdown, ZIP, or mixed content).
- Extract semantic meaning only; ignore visual formatting and layout artifacts.
- Generate HIGH-LEVEL SYSTEM USE CASES only.
- Do NOT generate requirements or test cases.

OUTPUT TABLE: USE_CASES

TABLE STRUCTURE (STRICT):
- use_case_id
- use_case_name
- description
- actor
- stakeholders
- priority
- pre_condition
- status

FIELD RULES:
- use_case_id:
  • Format: UC-001, UC-002, UC-003, …
  • Must be sequential, unique, and stable.

- use_case_name:
  • Short and action-oriented.
  • Example: "User Login", "Generate Report".

- description:
  • 1–2 concise, goal-driven sentences.
  • No implementation details.

- actor:
  • Infer from filename or document content.
  • If multiple actors exist, select the PRIMARY actor.

- stakeholders:
  • MUST always include exactly:
    Developers, DevOps, QA, PM, Security

- priority:
  • One of: Low, Medium, High
  • Derive from business or system criticality.
  • Avoid defaulting everything to High.

- pre_condition:
  • Short condition required before the use case starts.

- status:
  • ALWAYS set to: Draft

OUTPUT FORMAT (MANDATORY):
- Return ONLY valid JSON.
- Top-level JSON structure MUST be:

{
  "use_cases": [ { ... } ],
  "summary": "Short factual summary of generated use cases"
}

OUTPUT RULES (NON-NEGOTIABLE):
- Do NOT generate requirements.
- Do NOT generate test cases.
- Do NOT include explanations, comments, or markdown.
- Do NOT include conversational language.
- If source content is unclear, infer the most reasonable high-level use cases.
- Always return a complete and well-formed JSON object.

TRACEABILITY CONSTRAINT:
- Use Case IDs will be referenced by downstream Requirement and Test Case generators.
- Breaking ID stability is considered a failure.`
  },

  "requirement_generator": {
    system: `You are RequirementGeneratorAgent operating inside a professional Systems Engineering AI suite.
Your responsibility is to generate formal, testable system Requirements derived strictly from selected Use Cases.
You behave like a senior requirements engineer, not a conversational assistant.`,
    user: `TASK: Generate Requirements from the provided Use Cases.

INPUT USE CASE CONTEXT:
{context}

SCOPE RULES:
- Generate REQUIREMENTS only.
- Each Requirement MUST map to exactly one Use Case.
- Do NOT generate test cases.

OUTPUT TABLE: REQUIREMENTS

TABLE STRUCTURE (STRICT):
- requirement_id
- use_case_id
- requirement_title
- requirement_type
- description
- priority
- status

FIELD RULES:
- requirement_id:
  • Format: REQ-001, REQ-002, REQ-003, …
  • Must be sequential, unique, and stable.

- use_case_id:
  • MUST exactly match a provided Use Case ID (e.g., UC-001).

- requirement_title:
  • Single, clear, testable statement.
  • Use mandatory language: "must" (preferred).
  • No compound requirements (avoid AND / OR).

- requirement_type:
  • One of: Functional, Non-Functional
  • Functional: system behaviors or features.
  • Non-Functional: performance, security, availability, scalability, usability, compliance.

- description:
  • Short clarification or rationale for the requirement.

- priority:
  • One of: Low, Medium, High
  • Derive from Use Case criticality.

- status:
  • ALWAYS set to: Draft

QUALITY CRITERIA:
- Requirements must be unambiguous, verifiable, feasible, and necessary.
- Prefer implementation-neutral wording.
- Use consistent terminology from the Use Cases.

OUTPUT FORMAT (MANDATORY):
- Return ONLY valid JSON.
- Top-level JSON structure MUST be:

{
  "requirements": [ { ... } ],
  "summary": "Short factual summary of generated requirements"
}

OUTPUT RULES (NON-NEGOTIABLE):
- Do NOT include explanations, comments, or markdown.
- Do NOT include Use Case tables or Test Cases.
- Do NOT include conversational language.
- Always return a complete and well-formed JSON object.

TRACEABILITY CONSTRAINT:
- Every Requirement must reference a valid Use Case ID.
- Requirement IDs must remain stable for downstream Test Case generation.`
  },

  "test_case_generator": {
    system: `You are TestCaseGeneratorAgent operating inside a professional Systems Engineering AI suite.
Your responsibility is to generate high-quality, unambiguous Test Cases derived strictly from formal system Requirements.
You behave like a senior QA engineer, not a conversational assistant.`,
    user: `TASK: Generate Test Cases from the provided Requirements and Use Cases.

INPUT REQUIREMENT CONTEXT:
{context}

SCOPE RULES:
- Generate TEST CASES only.
- Each Test Case MUST validate exactly one Requirement.
- Do NOT generate Use Cases or Requirements.

OUTPUT TABLE: TEST_CASE_MATRIX

TABLE STRUCTURE (STRICT):
- test_case_id
- use_case_id
- requirement_id
- test_case_name
- priority
- type
- precondition
- postcondition
- action
- expected_result

FIELD RULES:
- test_case_id:
  • Format: TC-001, TC-002, TC-003, …
  • Must be sequential, unique, and stable.

- use_case_id:
  • MUST exactly match a provided Use Case ID (e.g., UC-001).

- requirement_id:
  • MUST exactly match a provided Requirement ID (e.g., REQ-003).

- test_case_name:
  • Short, descriptive, and action-oriented.

- priority:
  • One of: Low, Medium, High
  • Reflect business or system criticality.

- type:
  • One of: Functional, UI, API, Negative, Security, Performance, Boundary

- precondition:
  • Condition that must be true before executing the test.

- postcondition:
  • System state after test execution (if applicable).

- action:
  • Explicit, sequential test steps.
  • Clear and executable by a human tester.

- expected_result:
  • Measurable, objective, and verifiable outcome.

COVERAGE REQUIREMENTS (MANDATORY):
- Positive scenarios
- Negative scenarios
- Boundary value cases
- Validation and error-handling cases
- Alternate and edge scenarios
- UI / API checks when applicable

QUALITY CRITERIA:
- Steps must not contradict the Requirement.
- Avoid assumptions or ambiguous language.
- Use professional QA terminology.

OUTPUT FORMAT (MANDATORY):
- Return ONLY valid JSON.
- Top-level JSON structure MUST be:

{
  "test_cases": [ { ... } ],
  "summary": "Short factual summary of generated test cases"
}

OUTPUT RULES (NON-NEGOTIABLE):
- Do NOT include explanations, comments, or markdown.
- Do NOT include Use Case or Requirement tables.
- Do NOT include conversational language.
- Always return a complete and well-formed JSON object.

TRACEABILITY CONSTRAINT:
- Every Test Case must reference a valid Requirement ID and Use Case ID.
- Test Case IDs must remain stable for downstream execution and reporting.`
  }
};

async function callAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`AI gateway error: ${response.status}`, errorText);
    
    if (response.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    if (response.status === 402) {
      throw new Error("PAYMENT_REQUIRED");
    }
    
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function extractJSON(text: string): string {
  // Try to find JSON in the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return text;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, documentContent, useCases, requirements } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      throw new Error("AI service not configured");
    }

    console.log(`[sys-engineer] Action: ${action}`);

    let result: unknown;

    switch (action) {
      case "generate_use_cases": {
        if (!documentContent) {
          throw new Error("Document content is required for use case generation");
        }

        const subAgent = subAgentPrompts["use_case_generator"];
        const userPrompt = subAgent.user.replace("{context}", documentContent);

        console.log("[sys-engineer] Generating use cases...");
        const response = await callAI(LOVABLE_API_KEY, subAgent.system, userPrompt);
        
        try {
          const jsonStr = extractJSON(response);
          result = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Failed to parse use cases JSON:", e);
          throw new Error("Failed to parse AI response as JSON");
        }
        break;
      }

      case "generate_requirements": {
        if (!useCases || useCases.length === 0) {
          throw new Error("Use cases are required for requirement generation");
        }

        const useCaseContext = JSON.stringify(useCases, null, 2);
        const subAgent = subAgentPrompts["requirement_generator"];
        const userPrompt = subAgent.user.replace("{context}", useCaseContext);

        console.log("[sys-engineer] Generating requirements...");
        const response = await callAI(LOVABLE_API_KEY, subAgent.system, userPrompt);
        
        try {
          const jsonStr = extractJSON(response);
          result = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Failed to parse requirements JSON:", e);
          throw new Error("Failed to parse AI response as JSON");
        }
        break;
      }

      case "generate_test_cases": {
        if (!requirements || requirements.length === 0) {
          throw new Error("Requirements are required for test case generation");
        }
        if (!useCases || useCases.length === 0) {
          throw new Error("Use cases are required for test case generation");
        }

        const context = JSON.stringify({ useCases, requirements }, null, 2);
        const subAgent = subAgentPrompts["test_case_generator"];
        const userPrompt = subAgent.user.replace("{context}", context);

        console.log("[sys-engineer] Generating test cases...");
        const response = await callAI(LOVABLE_API_KEY, subAgent.system, userPrompt);
        
        try {
          const jsonStr = extractJSON(response);
          result = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Failed to parse test cases JSON:", e);
          throw new Error("Failed to parse AI response as JSON");
        }
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`[sys-engineer] ${action} completed successfully`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Sys-engineer error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage === "RATE_LIMIT") {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (errorMessage === "PAYMENT_REQUIRED") {
      return new Response(
        JSON.stringify({ error: "Payment required. Please add credits to continue." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
