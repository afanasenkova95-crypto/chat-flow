import { NextRequest } from 'next/server';
import { getOpenAIClient } from '@/app/lib/openai';
import { SLIDES_PROMPT } from '@/app/lib/prompts';

interface RawSlide {
  id: string;
  number: number;
  title: string;
  content: string;
  layout: string;
  bullets?: string[];
  imagePrompt?: string;
  imageUrl?: string;
  tag?: string;
}

function resolveImageUrl(prompt: string, index: number): string {
  const keywords = prompt.trim().split(/\s+/).slice(0, 4).join(',');
  return `https://loremflickr.com/800/450/${encodeURIComponent(keywords)}?lock=${index}`;
}

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

    let slides: RawSlide[];
    if (jsonMatch) {
      slides = JSON.parse(jsonMatch[1]);
    } else {
      slides = JSON.parse(content);
    }

    slides.forEach((slide, i) => {
      if (slide.layout === 'image-text' && slide.imagePrompt) {
        slide.imageUrl = resolveImageUrl(slide.imagePrompt, i);
      }
    });

    return Response.json({ slides });
  } catch (error) {
    console.error('Generate slides error:', error);
    return Response.json({ error: 'Failed to generate slides' }, { status: 500 });
  }
}
