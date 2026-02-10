import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
const MAX_SIZE_KB = 5120; // 5MB

function getFileType(mimeType: string): string {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("wordprocessingml")) return "docx";
  return "txt";
}

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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: "Unsupported file type",
          accepted: ["PDF", "DOCX", "TXT"],
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size
    const fileSizeKB = Math.ceil(file.size / 1024);
    if (fileSizeKB > MAX_SIZE_KB) {
      return new Response(
        JSON.stringify({ error: `File too large. Maximum size is ${MAX_SIZE_KB / 1024}MB` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileType = getFileType(file.type);
    const storagePath = `${user.id}/${crypto.randomUUID()}.${fileType}`;

    // Upload to storage
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, fileBuffer, { contentType: file.type });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert metadata record
    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        filename: file.name,
        file_type: fileType,
        file_size_kb: fileSizeKB,
        storage_path: storagePath,
        status: "uploaded",
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to register resume" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        resume_id: resume.id,
        filename: resume.filename,
        file_type: resume.file_type,
        file_size_kb: resume.file_size_kb,
        status: resume.status,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Resume upload error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
