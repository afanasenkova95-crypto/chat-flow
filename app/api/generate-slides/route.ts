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

async function resolveImageUrl(prompt: string): Promise<string> {
  const keywords = encodeURIComponent(prompt.trim());
  const url = `https://api.unsplash.com/search/photos?query=${keywords}&per_page=1&orientation=landscape`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: 'Client-ID 1rnyOQOaJeHFSJKwH8k2MbQ7v9IVZqRwKqEyDr2Kdj0' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results?.[0]?.urls?.regular) {
        return data.results[0].urls.regular;
      }
    }
  } catch {
    // fall through to fallback
  }
  return `https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=450&fit=crop`;
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

    const imageSlides = slides.filter(s => s.layout === 'image-text' && s.imagePrompt);
    await Promise.all(
      imageSlides.map(async (slide) => {
        slide.imageUrl = await resolveImageUrl(slide.imagePrompt!);
      })
    );

    return Response.json({ slides });
  } catch (error) {
    console.error('Generate slides error:', error);
    return Response.json({ error: 'Failed to generate slides' }, { status: 500 });
  }
}
