import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FREE_TIER_LIMIT = 2;

// Call OpenRouter Claude 3.5 Sonnet
async function callOpenRouter(prompt, cvText, jobDescription, apiKey) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://cvtuner.app",
      "X-Title": "AI-CV-Tuner",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "anthropic/claude-3.7-sonnet",
      "max_tokens": 8192,
      "messages": [
        { "role": "system", "content": prompt },
        { "role": "user", "content": `CV: ${cvText}\n\nJD: ${jobDescription}` }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("OpenRouter Error:", data);
    throw new Error(data.error?.message || 'Failed to fetch from OpenRouter');
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenRouter');
  return text;
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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is missing or invalid' }, { status: 500 });
    }

    const prompt = `
You are a Lead ATS Architect & Strategic Career Consultant.
Objective: Transform the raw CV into an ATS-optimized document that matches the target Job Description with maximum semantic relevance, professional link handling, and actionable gap analysis.

═══════════════════════════════════════
USER CONTEXT IS PROVIDED SEPARATLY AS MESSAGE CONTENT (CV AND JD).
═══════════════════════════════════════
${additionalContext ? `\nADDITIONAL CONTEXT FROM CANDIDATE:\n${additionalContext}\n` : ''}

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
- VISUAL CENTERING & LAYOUT ENGINE: Ensure all generated text strings are formatted to fit cleanly within standard 1-inch PDF margins. Write concise strings for \`personal_info\` (no line breaks in email/phone) and \`summary\` so that they align beautifully and never mathematically float out of bounds to the top-right of the page container.

═══════════════════════════════════════
MISSING INFO & ANTI-LOOP WIZARD LOGIC:
═══════════════════════════════════════
- Exhaustive Extraction: Identify ALL "Hard Gaps" and "Soft Gaps" on the ONE-PASS analysis.
- Only add a question to "missing_info_wizard" if the JD explicitly requires a qualification completely absent from the CV.
- NO RE-PROMPTING: If "ADDITIONAL CONTEXT FROM CANDIDATE" is present in your input, you are in a **Re-Optimization Loop**. You are strictly forbidden from generating new questions. You MUST set "missing_info_wizard" to an empty array [] and integrate the user's answers securely into the document facts.

═══════════════════════════════════════
THE "CAREER BRIDGE REPORT" & SCORING LOGIC
═══════════════════════════════════════
- SCORING STABILITY: "match_score" represents the current alignment. "potential_score" is what is achievable. 
- PROGRESSIVE VALIDATION: If the user provided "ADDITIONAL CONTEXT", you must treat their previous score as the new baseline. The new "match_score" MUST rise because a factual gap was bridged.
- "potential_score" should only remain higher than "match_score" if there are still unanswered bridge actions.
- Gap Detection: Identify missing tools/methodologies and generate a 1-step "Bridge Action" mapped to "bridge_report".
- Include a "ui_trigger" indicating which CV section the user should apply the fix to.

═══════════════════════════════════════
═══════════════════════════════════════
THE "LOGIC LENS" & WHY GENERATOR (Required):
═══════════════════════════════════════
- Document maximum 2 of your most impactful rewrites in the "visual_changes" array.
- Keep the snippets very short (under 20 words each).
- For each, provide the EXACT "original" text you found, the "optimized" text you replaced it with.
- "strategy_insight": Explain the "Why" behind the change (e.g. "Bridging GA4 to Adobe Launch functionality to pass technical filters").

═══════════════════════════════════════
OUTPUT SCHEMA (strict JSON only, no markdown):
═══════════════════════════════════════
{
  "scores": {
    "match": Number,
    "potential": Number
  },
  "bridge_report": [
    { "gap": "String (skill/tool name)", "action": "String (how to fix)", "impact": "String (High/Low)", "ui_trigger": "String (e.g. Experience)" }
  ],
  "improvements": [String],
  "visual_changes": [
    {
      "original": "String",
      "optimized": "String",
      "strategy_insight": "String"
    }
  ],
  "missing_info_wizard": [String],
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

    const textOutput = await callOpenRouter(prompt, cvText, jobDescription, apiKey);
    
    // Helper to safely parse and strip JSON
    const parseValidJSON = (text) => {
      let cleaned = text;
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }
      try {
        return JSON.parse(cleaned.trim());
      } catch (err) {
        if (err.message.includes('Unterminated')) {
           try { return JSON.parse(cleaned.trim() + '"}'); } catch(e) {}
           try { return JSON.parse(cleaned.trim() + '"]}'); } catch(e) {}
           try { return JSON.parse(cleaned.trim() + '}'); } catch(e) {}
           try { return JSON.parse(cleaned.trim() + '}}'); } catch(e) {}
        }
        console.error("Failed to parse AI output:", cleaned);
        throw new Error("The AI overloaded and abruptly cut off the document. Try generating again, or simplify dense paragraphs in your CV.");
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
