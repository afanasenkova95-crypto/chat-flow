import { NextRequest } from 'next/server';
import { getOpenAIClient } from '@/app/lib/openai';
import { STRUCTURE_PROMPT } from '@/app/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { topic, requirements, chatHistory, attachments } = await request.json();

    const openai = getOpenAIClient();

    const attachmentContents = attachments
      ?.filter((a: { content?: string }) => a.content)
      .map((a: { name: string; content: string }) => `\n--- File: ${a.name} ---\n${a.content}`)
      .join('\n') || '';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: STRUCTURE_PROMPT,
        },
        {
          role: 'user',
          content: `Topic: ${topic}
Requirements: ${JSON.stringify(requirements)}
Chat context: ${chatHistory || ''}
${attachmentContents ? `\nAttached file contents:\n${attachmentContents}` : ''}

Generate the presentation structure based on all the information above, including the file contents.`,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);

    if (jsonMatch) {
      const structure = JSON.parse(jsonMatch[1]);
      return Response.json({ structure });
    }

    try {
      const structure = JSON.parse(content);
      return Response.json({ structure });
    } catch {
      return Response.json({ error: 'Failed to parse structure', raw: content }, { status: 500 });
    }
  } catch (error) {
    console.error('Generate structure error:', error);
    return Response.json({ error: 'Failed to generate structure' }, { status: 500 });
  }
}
