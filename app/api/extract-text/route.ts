import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    let text = '';
    let preview = '';

    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({
        data,
        useSystemFonts: false,
        disableFontFace: true,
        isOffscreenCanvasSupported: false,
      });
      const result = await parser.getText({ pageJoiner: '\n\n' });
      text = result.text;

      try {
        const screenshot = await parser.getScreenshot({
          partial: [1],
          scale: 0.5,
          imageDataUrl: true,
          imageBuffer: false,
        });
        if (screenshot.pages.length > 0 && screenshot.pages[0].dataUrl) {
          preview = screenshot.pages[0].dataUrl;
        }
      } catch (e) {
        console.log('[Extract] Screenshot generation skipped:', (e as Error).message);
      }

      await parser.destroy();
    } else if (
      file.type === 'text/plain' ||
      file.name.endsWith('.txt')
    ) {
      text = await file.text();
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      const buffer = Buffer.from(await file.arrayBuffer());
      text = extractBasicDocxText(buffer);
    } else if (
      file.type === 'application/msword' ||
      file.name.endsWith('.doc')
    ) {
      text = await file.text();
    } else {
      text = await file.text();
    }

    const trimmed = text.trim().slice(0, 50000);
    console.log('[Extract] Extracted text length:', trimmed.length, 'from file:', file.name);

    return Response.json({ text: trimmed, preview: preview || undefined });
  } catch (error) {
    console.error('Text extraction error:', error);
    return Response.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    );
  }
}

function extractBasicDocxText(buffer: Buffer): string {
  const content = buffer.toString('utf-8');
  const matches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (!matches) return '';
  return matches
    .map((m) => m.replace(/<[^>]+>/g, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
