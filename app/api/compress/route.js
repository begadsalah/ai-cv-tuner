import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { cvData } = body;

    if (!cvData) {
      return NextResponse.json({ error: 'Missing cvData block' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is missing or invalid' }, { status: 500 });
    }

    const prompt = `You are an expert ATS optimization engine. The user needs to shrink their CV to fit perfectly onto exactly 1 A4 page, but they cannot afford to lose ANY crucial ATS search keywords or structural identity.

Here is the current CV structurally defined in JSON:
---
${JSON.stringify(cvData, null, 2)}
---

Task:
Strictly compress the vertical footprint of this CV text using Semantic Compression while returning the EXACT same JSON object schema.

Constraint Protocol for "Semantic Compression":
1. Merge fragmented bullets into single, highly-dense action sentences. Replace long phrases with short, powerful action verbs.
2. Cut "fluff" but NEVER remove hard technical ATS keywords, Job Titles, Companies, numeric metrics, or dates.
3. For the Skills section, enforce a strict "Category: Technology1, Technology2" format (e.g. "Tracking: GA4, GTM").
4. ZERO DATA LOSS ON CONTACTS: NEVER delete or truncate Location, emails, or phones.

Output ONLY the raw JSON object mimicking the input schema. No markdown, no code blocks. Pure JSON only.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://cvtuner.app',
        'X-Title': 'AI-CV-Tuner',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.7-sonnet',
        max_tokens: 4096,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter Request Failed:', data);
      throw new Error(data.error?.message || 'Failed to compress with OpenRouter');
    }

    let textOutput = data.choices?.[0]?.message?.content;
    if (!textOutput) throw new Error('Empty response from OpenRouter');
    
    // Robust JSON extraction: find first { and last }
    const firstBrace = textOutput.indexOf('{');
    const lastBrace = textOutput.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      textOutput = textOutput.substring(firstBrace, lastBrace + 1);
    }

    const compressedJson = JSON.parse(textOutput);

    return NextResponse.json({ compressed_cv_modular: compressedJson });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
