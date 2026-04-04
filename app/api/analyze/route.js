import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
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
   - Detect the language of the Job Description natively (e.g. English, German). You MUST generate the entire optimized CV, section headers, and cover letter natively in the exact language of the Job Description (e.g., use 'Berufserfahrung' for German or 'Experience' for English) to match ATS filtering rules completely.
   - Detect weak action verbs ("helped", "worked on", "managed") and replace them with strong industry-leading verbs ("Orchestrated", "Architected", "Engineered").
   - Eliminate redundant bullet points by merging them logically.
   - For Skills and Technologies sections, group them inline laterally (e.g., "Languages: Python, Java") rather than printing massive vertical bullet lists.
   Structure the optimized CV completely with clean HTML tags (<h1>, <h2>, <h3>, <ul>, <li>, <p>).
3. Calculate the new projected ATS match score (0-100) after optimization.
4. List 3 to 5 specific improvements made. Crucially, explicitly explain HOW each improvement maps directly to what this specific ATS is looking for based on the Job Description (e.g., "Upgraded 'handled database' to 'Architected Postgres clusters' to match JD keywords").
5. Write a professional, tailored Cover Letter based on the optimized CV (return as plain text with newlines).
6. Identify if any critical qualifications are completely missing. Return an array of missing data questions.

Return a JSON object matching this schema. Your output must ONLY be the JSON payload so that it can be parsed immediately.
{
  "original_score": Number,
  "optimized_score": Number,
  "improvements": [String, String, ...],
  "missing_info": [String, ...],
  "optimized_cv": "HTML String with CV content.",
  "cover_letter": "String of the cover letter with newlines"
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
