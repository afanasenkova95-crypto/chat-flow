import { NextRequest } from 'next/server';
import { getOpenAIClient } from '@/app/lib/openai';
import { SLIDES_PROMPT } from '@/app/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { structure, theme, requirements, topic } = await request.json();

    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SLIDES_PROMPT,
        },
        {
          role: 'user',
          content: `Topic: ${topic}
Theme: ${theme?.name || 'Default'}
Requirements: ${JSON.stringify(requirements)}
Structure: ${JSON.stringify(structure)}

Generate the full slide content for each slide in the structure.`,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);

    if (jsonMatch) {
      const slides = JSON.parse(jsonMatch[1]);
      return Response.json({ slides });
    }

    try {
      const slides = JSON.parse(content);
      return Response.json({ slides });
    } catch {
      return Response.json({ error: 'Failed to parse slides', raw: content }, { status: 500 });
    }
  } catch (error) {
    console.error('Generate slides error:', error);
    return Response.json({ error: 'Failed to generate slides' }, { status: 500 });
  }
}
