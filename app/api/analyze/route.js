import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FREE_TIER_LIMIT = 2;

// Models in fallback order — most capable first, most available last
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

export const maxDuration = 60; // Allow maximum Vercel timeout (60s on Hobby)

// Retry Gemini with exponential backoff + model fallback
async function callGeminiWithRetry(prompt, apiKey) {
  const maxRetries = 2; // Reduced to prevent Vercel 504 timeouts

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.15,
                maxOutputTokens: 8192,
              },
            }),
          }
        );

        const data = await res.json();

        // Overloaded or rate-limited — retry or fall to next model
        if (!res.ok) {
          const errMsg = data.error?.message || '';
          const isRetryable = res.status === 429 || res.status === 503 || errMsg.includes('overloaded');
          console.warn(`[${model}] attempt ${attempt} failed (${res.status}): ${errMsg}`);

          if (isRetryable && attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, attempt * 1000)); // 1s, 2s max wait
            continue;
          }
          break; // Move to next model
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty response from Gemini');
        return text;

      } catch (err) {
        console.warn(`[${model}] attempt ${attempt} threw:`, err.message);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
        }
      }
    }
  }

  throw new Error(
    'The AI service is temporarily overloaded. Please wait 30 seconds and try again.'
  );
}

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Usage Gate ---
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status, usage_count')
      .eq('user_id', user.id)
      .maybeSingle();

    const isPro = subscription?.status === 'active';
    const usageCount = subscription?.usage_count ?? 0;

    if (!isPro && usageCount >= FREE_TIER_LIMIT) {
      return NextResponse.json(
        { error: 'LIMIT_REACHED', message: `Free tier limit of ${FREE_TIER_LIMIT} optimizations reached.` },
        { status: 402 }
      );
    }

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
You are a Lead ATS Architect & Strategic Career Consultant.
Objective: Transform the raw CV into an ATS-optimized document that matches the target Job Description with maximum semantic relevance, professional link handling, and actionable gap analysis.

═══════════════════════════════════════
ORIGINAL CV (treat as sacred source of truth):
═══════════════════════════════════════
${cvText}

═══════════════════════════════════════
TARGET JOB DESCRIPTION:
═══════════════════════════════════════
${jobDescription}

${additionalContext ? `═══════════════════════════════════════\nADDITIONAL CONTEXT FROM CANDIDATE:\n═══════════════════════════════════════\n${additionalContext}\n` : ''}

═══════════════════════════════════════
YOUR CORE MISSION
═══════════════════════════════════════
Optimize this CV to maximise ATS keyword matching for this specific job — WITHOUT fabricating, removing, or distorting any original facts.

═══════════════════════════════════════
ABSOLUTE PRESERVATION RULES (never violate):
═══════════════════════════════════════
1. ZERO DATA REMOVAL
   - Every job title, company, date range from the original CV MUST appear in the output.
   - Every degree, institution, graduation year MUST appear in the output.
   - Never abbreviate or omit any role, even short-term or internship positions.

2. PRESERVE ALL QUANTITATIVE ACHIEVEMENTS
   - Every number, percentage, metric, count, or monetary value in the original MUST appear EXACTLY as written (e.g., "reduced costs by 40%", "managed team of 12", "€2M budget"). Never paraphrase or omit them.

3. PRESERVE ALL LINKS
   - LinkedIn URLs, GitHub URLs, portfolio links, and project URLs MUST be kept exactly as they appear. Never drop or truncate them.

4. NO FABRICATION
   - Never add a skill, tool, certification, or achievement that is not mentioned in the original CV or in the candidate's additional context.
   - Do NOT claim the candidate is "certified in X" or "expert in Y" unless explicitly stated.

5. STRENGTHEN, NEVER REPLACE
   - Rewrite bullet points to use stronger, ATS-friendly active verbs — but keep the factual core identical.
   - Reorder or regroup content sections to better match the job description keywords.

6. SEMANTIC TOOL & SKILL BRIDGING
   - Universal Logic: Do not penalize users for missing a specific brand-name tool if they possess a functional equivalent.
   - Action: If a user has a highly equivalent skill (e.g. GA4), but the job requires a related one (e.g. Adobe Analytics), rewrite to emphasize the Universal Function without fabricating the specific brand if they don't have it (e.g., "Expertise in enterprise-level digital analytics platforms (e.g., GA4, translatable to Adobe ecosystems)").
   - Active Voice: Upgrade all bullet points to the [Action Verb] + [Quantifiable Metric] + [Result] formula.

7. PROFESSIONAL LINK OPTIMIZATION
   - Labeling: Convert all raw messy URLs (e.g., long Google Drive links, bad portfolio links) into clean, professional descriptive text names.
   - Example: Instead of "https://drive.google.com/...", use "Professional Portfolio" or "Project Evaluation" as the text while keeping the URL intact. Space Saving: Consolidate to save vertical space.

═══════════════════════════════════════
OPTIMIZATION RULES:
═══════════════════════════════════════
- LANGUAGE DETECTION: Detect the language of the Job Description. Generate ALL section titles and text natively in that language (e.g., German JD → "Berufserfahrung", not "Experience").
- KEYWORD INJECTION: Identify the top 10 ATS keywords from the job description. Weave them naturally into bullet points, summary, and skills — only where factually supported by the original CV.
- SKILLS SECTION FORMAT: Use strict "Category: Tool1, Tool2, Tool3" format.
- SUMMARY: Write a 3-sentence professional summary that mirrors the job description language closely.
- COVER LETTER: Generate a highly concise cover letter (max 150 words).
- COMPRESSION: If the CV is very long, tighten bullet points by merging overlapping statements — but never delete a distinct achievement.
- CONTACT FIELDS: Preserve name, email, phone, location, and LinkedIn exactly as found.
- NO LINE BREAKS in single-value fields: email, phone, location must be single inline strings.

═══════════════════════════════════════
MISSING INFO (critical filtering rule):
═══════════════════════════════════════
Only add a question to "missing_info" if:
- The job description explicitly requires a qualification (e.g., certification, language, tool)
- AND that qualification is completely absent from the original CV and additional context
- Do NOT ask about anything already present in the CV, even if phrased differently.
- Maximum 3 questions. Return an empty array [] if nothing is truly missing.

═══════════════════════════════════════
THE "CAREER BRIDGE REPORT" LOGIC
═══════════════════════════════════════
- Gap Detection: Identify "Hard Gaps" (missing certifications/tools) and "Soft Gaps" (missing methodologies) compared to the Target Job Description.
- Roadmap Generation: For every major gap, generate a 1-step "Bridge Action". Output this directly to the "bridge_report" array.

═══════════════════════════════════════
CHANGE TRACING (Required):
═══════════════════════════════════════
- Document maximum 2 of your most impactful rewrites.
- Keep the snippets very short (under 20 words each).
- For each, provide the EXACT "original_text" you found, and the "optimized_text" you replaced it with.

═══════════════════════════════════════
OUTPUT SCHEMA (strict JSON only, no markdown):
═══════════════════════════════════════
{
  "match_score": Number,
  "potential_score": Number,
  "bridge_report": [
    { "gap": "String (skill/tool name)", "action": "String (how to fix)", "impact": "String (High/Low)" }
  ],
  "improvements": [String],
  "change_log": [
    {
      "type": "String (e.g., 'Summary Rewrite', 'Bullet Enhancement')",
      "original_text": "String",
      "optimized_text": "String"
    }
  ],
  "missing_info": [String],
  "cover_letter": "String",
  "optimized_cv_modular": {
    "personal_info": {
      "name": "String",
      "email": "String",
      "phone": "String",
      "location": "String",
      "linkedin": "String"
    },
    "summary": {
      "section_title": "String",
      "content": "String"
    },
    "experience": {
      "section_title": "String",
      "items": [
        { "title": "String", "company": "String", "date": "String", "bullets": ["String"] }
      ]
    },
    "education": {
      "section_title": "String",
      "items": [
        { "degree": "String", "school": "String", "date": "String", "bullets": ["String"] }
      ]
    },
    "skills": {
      "section_title": "String",
      "view_mode": "inline",
      "items": ["String"]
    },
    "languages": {
      "section_title": "String",
      "view_mode": "inline",
      "items": ["String"]
    },
    "custom_projects": {
      "section_title": "String",
      "items": [
        { "title": "String", "description": "String", "date": "String", "bullets": ["String"] }
      ]
    }
  }
}
`;

    const textOutput = await callGeminiWithRetry(prompt, apiKey);
    
    // Helper to safely parse and strip JSON
    const parseValidJSON = (text) => {
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\\n?/m, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\\n?/m, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/m, '');
      try {
        return JSON.parse(cleaned.trim());
      } catch (err) {
        if (err.message.includes('Unterminated')) {
           try { return JSON.parse(cleaned.trim() + '"}'); } catch(e) {}
           try { return JSON.parse(cleaned.trim() + '"]}'); } catch(e) {}
           try { return JSON.parse(cleaned.trim() + '}'); } catch(e) {}
           try { return JSON.parse(cleaned.trim() + '}}'); } catch(e) {}
        }
        throw err;
      }
    };

    const resultObj = parseValidJSON(textOutput);

    // --- Increment usage count ---
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

    const remaining = isPro ? null : FREE_TIER_LIMIT - (usageCount + 1);
    return NextResponse.json({ ...resultObj, remaining, isPro });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
