'use client';

import { useCallback } from 'react';
import { usePresentation } from '@/app/context/PresentationContext';
import { ChatMessageData } from '@/app/lib/types';

export function useChat() {
  const { state, dispatch } = usePresentation();

  const sendMessage = useCallback(
    async (content: string, phase?: string) => {
      const userMessage: ChatMessageData = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_MESSAGE', message: userMessage });

      const assistantMessage: ChatMessageData = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_MESSAGE', message: assistantMessage });

      const apiMessages = [...state.chatMessages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      dispatch({ type: 'SET_STREAMING', isStreaming: true });

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            presentationContext: {
              topic: state.topic,
              themeName: state.selectedTheme?.name,
              themeId: state.selectedTheme?.id,
              attachments: state.attachments,
              phase: phase || 'requirements',
              structure: state.structure.length > 0 ? state.structure.map(s => `${s.number}. ${s.title}`) : undefined,
              slideCount: state.slides.length || undefined,
              slides: (phase === 'done' && state.slides.length > 0)
                ? state.slides.map(s => ({ number: s.number, title: s.title, content: s.content, layout: s.layout }))
                : undefined,
            },
          }),
        });

        if (!response.ok) throw new Error('Chat request failed');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                fullContent += parsed.content;
                dispatch({ type: 'UPDATE_LAST_MESSAGE', content: fullContent });
              } catch {
                // skip malformed chunks
              }
            }
          }
        }

        dispatch({ type: 'SET_STREAMING', isStreaming: false });
        let cleanContent = fullContent.replace(/\n?\[READY\]/g, '');
        cleanContent = cleanContent.replace(/\n?\[CHANGES\][\s\S]*?\[\/CHANGES\]/g, '');
        cleanContent = cleanContent.trim();
        if (cleanContent !== fullContent) {
          dispatch({ type: 'UPDATE_LAST_MESSAGE', content: cleanContent });
        }
        return fullContent;
      } catch (error) {
        console.error('Chat error:', error);
        dispatch({ type: 'SET_STREAMING', isStreaming: false });
        dispatch({
          type: 'UPDATE_LAST_MESSAGE',
          content: 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте снова.',
        });
        return null;
      }
    },
    [state.chatMessages, state.topic, state.selectedTheme, state.attachments, dispatch]
  );

  const generateStructure = useCallback(async () => {
    dispatch({ type: 'SET_GENERATING', isGenerating: true });
    try {
      const response = await fetch('/api/generate-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: state.topic,
          requirements: state.requirements,
          chatHistory: state.chatMessages.map((m) => `${m.role}: ${m.content}`).join('\n'),
          attachments: state.attachments,
        }),
      });

      if (!response.ok) throw new Error('Structure generation failed');
      const data = await response.json();
      dispatch({ type: 'SET_STRUCTURE', structure: data.structure });
      return data.structure;
    } catch (error) {
      console.error('Structure generation error:', error);
      return null;
    } finally {
      dispatch({ type: 'SET_GENERATING', isGenerating: false });
    }
  }, [state.topic, state.requirements, state.chatMessages, dispatch]);

  const generateSlides = useCallback(async () => {
    dispatch({ type: 'SET_GENERATING', isGenerating: true });
    dispatch({ type: 'SET_PROGRESS', progress: { current: 0, total: state.structure.length } });

    try {
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structure: state.structure,
          theme: state.selectedTheme,
          requirements: state.requirements,
          topic: state.topic,
        }),
      });

      if (!response.ok) throw new Error('Slide generation failed');
      const data = await response.json();
      dispatch({ type: 'SET_SLIDES', slides: data.slides });
      dispatch({ type: 'SET_PROGRESS', progress: { current: data.slides.length, total: data.slides.length } });

      if (data.slides.length > 0 && data.slides[0].title) {
        dispatch({ type: 'SET_TITLE', title: data.slides[0].title });
      }

      return data.slides;
    } catch (error) {
      console.error('Slide generation error:', error);
      return null;
    } finally {
      dispatch({ type: 'SET_GENERATING', isGenerating: false });
    }
  }, [state.structure, state.selectedTheme, state.requirements, state.topic, dispatch]);

  return {
    messages: state.chatMessages,
    isGenerating: state.isGenerating,
    sendMessage,
    generateStructure,
    generateSlides,
  };
}
