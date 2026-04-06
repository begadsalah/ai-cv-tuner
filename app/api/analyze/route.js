import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Admin client bypasses RLS — safe for server-side writes
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FREE_TIER_LIMIT = 2;

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Usage Gate (use admin to avoid RLS read issues) ---
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status, usage_count')
      .eq('user_id', user.id)
      .maybeSingle();

    const isPro = subscription?.status === 'active';
    const usageCount = subscription?.usage_count ?? 0;

    if (!isPro && usageCount >= FREE_TIER_LIMIT) {
      return NextResponse.json(
        { error: 'LIMIT_REACHED', message: `Free tier limit of ${FREE_TIER_LIMIT} optimizations reached. Upgrade to Pro for unlimited access.` },
        { status: 402 }
      );
    }

    // --- Run Analysis ---
    const body = await req.json();
    const { cvText, jobDescription, additionalContext } = body;

    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: 'Missing cvText or jobDescription' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing or invalid' }, { status: 500 });
    }

    const prompt = `
You are an expert ATS optimizer, resume writer, and career coach.

Here is the candidate's current CV:
---
${cvText}
---

Here is the Job Description:
---
${jobDescription}
---

${additionalContext ? `The user has provided this additional context to incorporate into the new optimized CV version: "${additionalContext}"\nPlease integrate this context seamlessly into the optimized CV.` : ''}

Task:
1. Calculate the ATS match score (0-100) for the current CV against the Job Description.
2. Rewrite and optimize the CV to perfectly match the job description. Do not fabricate experience. 
   CRITICAL PRO-LEVEL OPTIMIZATION: 
   - IDEMPOTENCY LOCK: If the provided CV already appears highly optimized, condensed, or scores >85, DO NOT penalize the format. Document structures like dense lateral arrays MUST be preserved.
   - STRICT SEMANTIC OMISSIONS: Do not create redundant labels inside generic data lists. For example, under a Languages section, just list the languages. Do not write "Languages: English".
   - LANGUAGE DETECTION: Detect the language of the Job Description natively (e.g. English, German). You MUST generate all text and section_titles exactly natively in that language (e.g., 'Berufserfahrung' instead of 'Experience').
   - Replace weak verbs with strong active verbs. Merge redundant bullet points logically.
   - NO HARD LINE BREAKS: Within atomic values (like email, phone, location), NEVER insert newlines (\n) or HTML breaks. Keep strings perfectly inline.

   SMART 1-PAGE ENFORCEMENT & ERGONOMICS:
   - Perform Semantic Compression: If the CV is excessively long, you must reduce total character count by 15%. Do this by merging fragmented bullets into single high-impact action sentences. Replace long phrases with dense verbs.
   - CATEGORICAL SKILLS: For the Skills section, enforce a strict "Category: Technology1, Technology2" format (e.g. "Tracking: GA4, GTM, Adobe Launch").
   - ZERO DATA LOSS ON CONTACTS: NEVER delete or truncate Location (e.g., Mannheim) or Contact Details. These are hard ATS requirements.

3. Calculate the new projected ATS match score (0-100) after optimization.
4. List 3 to 5 specific improvements.
5. Write a professional Cover Letter based on the optimized CV.
6. Identify if any critical qualifications are completely missing. Return an array of missing data questions.

Return a JSON object matching exactly this schema. Your output must ONLY be the JSON payload so that it can be parsed immediately.
{
  "original_score": Number,
  "optimized_score": Number,
  "improvements": [String, ...],
  "missing_info": [String, ...],
  "cover_letter": "...",
  "optimized_cv_modular": {
    "personal_info": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "" },
    "summary": { "section_title": "Professional Summary", "content": "..." },
    "experience": { "section_title": "Experience", "items": [ { "title": "", "company": "", "date": "", "bullets": ["..."] } ] },
    "education": { "section_title": "Education", "items": [ { "degree": "", "school": "", "date": "", "bullets": ["..."] } ] },
    "skills": { "section_title": "Skills", "view_mode": "inline", "items": ["..."] },
    "languages": { "section_title": "Languages", "view_mode": "inline", "items": ["..."] },
    "custom_projects": { "section_title": "Projects", "items": [ { "title": "", "description": "", "date": "", "bullets": ["..."] } ] }
  }
}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to analyze with Gemini');
    }

    const textOutput = data.candidates[0].content.parts[0].text;
    const resultObj = JSON.parse(textOutput);

    // --- Increment usage count (admin client bypasses RLS) ---
    if (!isPro) {
      const newCount = usageCount + 1;
      if (subscription) {
        const { error: updateErr } = await supabaseAdmin
          .from('subscriptions')
          .update({ usage_count: newCount })
          .eq('user_id', user.id);
        if (updateErr) console.error('Failed to update usage_count:', updateErr.message);
      } else {
        const { error: insertErr } = await supabaseAdmin
          .from('subscriptions')
          .insert({ user_id: user.id, status: 'free', usage_count: newCount });
        if (insertErr) console.error('Failed to insert subscription row:', insertErr.message);
      }
    }

    // Attach remaining uses to response for UI
    const remaining = isPro ? null : FREE_TIER_LIMIT - (usageCount + 1);
    return NextResponse.json({ ...resultObj, remaining, isPro });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
