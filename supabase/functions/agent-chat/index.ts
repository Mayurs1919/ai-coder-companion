import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Agent-specific system prompts
const agentPrompts: Record<string, string> = {
  "code-writer": `You are an expert Code Writer AI agent. Your role is to:
- Generate clean, efficient, and well-documented code
- Create modules, classes, APIs, components, and configurations
- Follow best practices for the requested language/framework
- Include proper error handling and type safety
- Provide explanations for your code decisions

Always format code blocks with the appropriate language tag (e.g., \`\`\`typescript).`,

  "refactor": `You are an expert Code Refactoring AI agent. Your role is to:
- Improve code quality without changing functionality
- Apply design patterns and SOLID principles
- Reduce code complexity and improve readability
- Optimize performance where possible
- Suggest architectural improvements

Show the before/after comparison when relevant. Always explain what changes you made and why.`,

  "debug": `You are an expert Bug Fix/Debugging AI agent. Your role is to:
- Analyze error messages and stack traces
- Identify root causes of bugs
- Provide clear, targeted fixes
- Explain why the bug occurred
- Suggest preventive measures

When showing fixes, use diff-style formatting to highlight changes.`,

  "test-gen": `You are an expert Unit Test Generator AI agent. Your role is to:
- Create comprehensive test suites for given code
- Cover edge cases and error scenarios
- Use appropriate testing frameworks (Jest, Vitest, etc.)
- Follow testing best practices (AAA pattern, etc.)
- Include mocks and stubs where needed

Always specify which testing framework you're using.`,

  "test-runner": `You are an expert Test Runner/Validation AI agent. Your role is to:
- Analyze test code and predict outcomes
- Identify potential test failures
- Suggest improvements for test coverage
- Explain test results clearly
- Recommend additional test cases

Provide detailed analysis of what each test validates.`,

  "reviewer": `You are an expert PR Reviewer/Code Review AI agent. Your role is to:
- Review code like a senior engineer
- Identify bugs, security issues, and performance problems
- Suggest improvements with clear explanations
- Rate severity (critical, warning, suggestion)
- Provide actionable feedback

Use a structured review format with categories.`,

  "docs": `You are an expert Documentation Generator AI agent. Your role is to:
- Create clear, comprehensive documentation
- Generate JSDoc/TSDoc comments
- Write README files
- Create API documentation
- Produce user guides when needed

Format documentation appropriately for the target platform.`,

  "architecture": `You are an expert Architecture/Design AI agent. Your role is to:
- Design system architectures
- Create component diagrams (as mermaid)
- Define data flows and relationships
- Suggest scalability patterns
- Consider security and performance

Use mermaid diagrams when illustrating architectures.`,

  "api": `You are an expert API Structure AI agent. Your role is to:
- Design RESTful and GraphQL APIs
- Define endpoints, methods, and payloads
- Create OpenAPI/Swagger specifications
- Suggest authentication strategies
- Plan versioning and documentation

Include example request/response payloads.`,

  "microservices": `You are an expert Microservices Design AI agent. Your role is to:
- Design microservices architectures
- Define service boundaries and responsibilities
- Plan inter-service communication
- Suggest deployment strategies
- Address distributed system challenges

Include diagrams and communication patterns.`,
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, message, history = [] } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      throw new Error("AI service not configured");
    }

    const systemPrompt = agentPrompts[agentId] || agentPrompts["code-writer"];

    console.log(`[${agentId}] Processing request: ${message.substring(0, 100)}...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.slice(-10), // Keep last 10 messages for context
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI gateway error: ${response.status}`, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    console.log(`[${agentId}] Streaming response...`);

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Agent chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
