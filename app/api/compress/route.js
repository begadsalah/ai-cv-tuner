import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { htmlContent } = body;

    if (!htmlContent) {
      return NextResponse.json({ error: 'Missing htmlContent' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing or invalid' }, { status: 500 });
    }

    const prompt = `
You are an expert ATS optimization engine. The user needs to shrink their CV to fit perfectly onto 1 page, but they cannot afford to lose ANY crucial ATS search keywords.

Here is the current CV in basic HTML format:
---
${htmlContent}
---

Task:
Strictly compress the vertical footprint of this CV text while preserving 100% of the technical skills, job titles, companies, and numeric metrics.

Compression Strategies:
1. Merge redundant bullet points: Combine short, closely related analytical bullets into a single, powerful sentence.
2. Fix bullet fragmentation: Detect label-value chains (e.g., a bullet saying "Arabic" followed by a bullet saying "Native") and merge them inline ("Arabic - Native").
3. Inline lists: Where appropriate (like in Skills or Languages sections), convert vertical bullet lists into inline comma-separated lists to save massive vertical space (e.g. "Languages: Arabic (Native), English (C1)").
4. Remove "fluff": Remove weak filler words, but NEVER remove hard ATS keywords.

Output exactly the same underlying HTML structure (<h1>, <h2>, <h3>, <ul>, <li>, <p>) but with the rewritten, highly-compacted text.
DO NOT wrap your response in markdown code blocks like \`\`\`html. Output raw HTML explicitly.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini Request Failed:', data);
      throw new Error(data.error?.message || 'Failed to compress with Gemini');
    }

    let textOutput = data.candidates[0].content.parts[0].text;
    
    // Clean up any potential markdown wrapper returned by mistake
    textOutput = textOutput.replace(/^```html\s*/i, '').replace(/```$/i, '').trim();

    return NextResponse.json({ compressed_html: textOutput });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
