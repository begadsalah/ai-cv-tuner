import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { cvText, jobDescription } = body;

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

Task:
1. Calculate the ATS match score (0-100) for the current CV against the Job Description.
2. Rewrite and optimize the CV to perfectly match the job description. Do not fabricate experience, but heavily tailor the skills and summaries. 
   Structure the optimized CV completely with clean HTML tags (<h1>, <h2>, <h3>, <ul>, <li>, <p>) suitable for rendering directly inside a React <div> block. DO NOT use <html>, <head>, or <body> tags. Ensure the HTML represents a clean, professional CV document grouping by Name/Contact, Summary, Skills, Experience, and Education.
3. Calculate the new projected ATS match score (0-100) after optimization.
4. List 3 to 5 specific improvements made.
5. Write a professional, tailored Cover Letter based on the optimized CV and job description (return as plain text with newlines or basic formatting).

Return a JSON object matching this schema. Your output must ONLY be the JSON payload so that it can be parsed immediately.
{
  "original_score": Number,
  "optimized_score": Number,
  "improvements": [String, String, ...],
  "optimized_cv": "HTML String with CV content. Be sure to use <h1> for the name, <h2> for section headers.",
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
