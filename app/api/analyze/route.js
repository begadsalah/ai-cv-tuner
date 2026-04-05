import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { cvText, jobDescription, additionalContext, language } = body;

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
   - LANGUAGE ENFORCEMENT: The user has requested output strictly in: [${language || 'English'}]. You MUST generate ALL text, bullet points, and section_titles exactly natively in this language (e.g., if German, use 'Berufserfahrung' instead of 'Experience').
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

    // Standard Direct API Call to Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini Request Failed:', data);
      throw new Error(data.error?.message || 'Failed to analyze with Gemini');
    }

    const textOutput = data.candidates[0].content.parts[0].text;
    const resultObj = JSON.parse(textOutput);

    return NextResponse.json(resultObj);
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
