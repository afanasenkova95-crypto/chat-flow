import { NextRequest } from 'next/server';
import { getOpenAIClient } from '@/app/lib/openai';
import { SYSTEM_PROMPT, REQUIREMENTS_PROMPT } from '@/app/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { messages, presentationContext } = await request.json();

    const openai = getOpenAIClient();

    const isFirstMessage = messages.length === 1;

    const attachmentList = presentationContext?.attachments?.map((a: { name: string }) => a.name).join(', ') || 'None';
    const attachmentContents = presentationContext?.attachments
      ?.filter((a: { content?: string }) => a.content)
      .map((a: { name: string; content: string }) => {
        const text = a.content.length > 12000 ? a.content.slice(0, 12000) + '\n...[текст обрезан]' : a.content;
        return `\n--- File: ${a.name} ---\n${text}`;
      })
      .join('\n') || '';

    const currentPhase = presentationContext?.phase || 'requirements';

    const confirmationInstruction = `\nIMPORTANT — Detecting user confirmation:
When the user CONFIRMS the settings and is ready to proceed (e.g. "да", "ок", "продолжаем", "всё устраивает", "давай", "погнали", "го", "отлично, начинай", or any clear agreement to the proposed settings), you MUST append the exact token [READY] at the very end of your response (on a new line, after your message text). This token will NOT be shown to the user — it is used internally by the app to trigger structure generation.
When the user is asking questions, wants to change something, or is still discussing — do NOT include [READY]. Just respond helpfully, make changes if needed, and ask if they're ready to continue.\n`;

    const slidesInfo = presentationContext?.slides
      ? presentationContext.slides.map((s: { number: number; title: string; content: string; layout: string }) =>
        `Slide ${s.number}: "${s.title}" (layout: ${s.layout}) — ${s.content?.slice(0, 120)}`
      ).join('\n')
      : '';

    const editInstruction = `\nThe presentation has been generated. The user can now ask you to improve or change the presentation.

CRITICAL: When the user asks for changes, you MUST include a [CHANGES] block at the END of your response (after your conversational text) containing a JSON array of change operations. The app will parse and apply them automatically.

Available change operations:
1. Update a slide: {"action": "update_slide", "slideNumber": 3, "title": "New Title", "content": "New content text", "layout": "bullets", "bullets": ["Point 1", "Point 2"]}
   - You can include any subset of fields (title, content, layout, bullets). Only included fields will be changed.
   - Available layouts: "title", "content", "two-column", "bullets", "quote"
2. Change the design theme: {"action": "change_theme", "themeId": "scandinavian"}
   - Available themes: deep-ruby, retro-modern, neo-minimalism, japanese, dark-graphite, dark-style, scandinavian, pine-evening
3. Remove a slide: {"action": "remove_slide", "slideNumber": 5}
4. Add a slide: {"action": "add_slide", "afterSlide": 3, "title": "New Slide", "content": "Content here", "layout": "content"}

Example response format:
"Готово! Я обновил заголовок третьего слайда и поменял тему на «Скандинавская».
[CHANGES][{"action": "update_slide", "slideNumber": 3, "title": "Новый заголовок"}, {"action": "change_theme", "themeId": "scandinavian"}][/CHANGES]"

RULES:
- Always include [CHANGES]...[/CHANGES] when the user asks for modifications
- The JSON must be a valid array inside the markers
- Describe what you changed in your conversational text BEFORE the [CHANGES] block
- The [CHANGES] block will NOT be shown to the user
- Always use "ты" (informal). Never use "вы".
- Be concise and helpful.
- If the user asks a question without requesting changes, just answer — no [CHANGES] block needed.

Current theme: ${presentationContext?.themeName || 'not set'} (id: ${presentationContext?.themeId || 'unknown'})
${presentationContext?.structure ? `\nSlide structure:\n${presentationContext.structure.join('\n')}` : ''}
${slidesInfo ? `\nSlide details:\n${slidesInfo}` : ''}
${presentationContext?.slideCount ? `Total slides: ${presentationContext.slideCount}` : ''}\n`;

    let phaseInstruction = '';
    if (isFirstMessage) {
      phaseInstruction = `\n${REQUIREMENTS_PROMPT}\n`;
    } else if (currentPhase === 'done' || currentPhase === 'generating') {
      phaseInstruction = editInstruction;
    } else {
      phaseInstruction = confirmationInstruction;
    }

    const systemMessage = `${SYSTEM_PROMPT}
${phaseInstruction}
Current presentation context:
- Topic: ${presentationContext?.topic || 'Not specified'}
- Theme: ${presentationContext?.themeName || 'Not selected'}
- Attachments: ${attachmentList}
${attachmentContents ? `\nAttached file contents:\n${attachmentContents}` : ''}
`;

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages,
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Chat API error:', errMsg);
    return Response.json(
      { error: errMsg || 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
