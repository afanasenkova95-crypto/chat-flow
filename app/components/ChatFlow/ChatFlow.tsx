'use client';

import { useState, useEffect, useRef } from 'react';
import { FigmaIcon } from '@campstudio/camp-ui-kit';
import { usePresentation } from '@/app/context/PresentationContext';
import { useChat } from '@/app/hooks/useChat';
import { themes } from '@/app/lib/themes';
import { Slide } from '@/app/lib/types';
import StructureView from '@/app/components/StructureView/StructureView';
import LoadingInput from '@/app/components/LoadingInput/LoadingInput';
import loadingStyles from '@/app/components/LoadingInput/LoadingInput.module.css';
import styles from './ChatFlow.module.css';

interface ChatFlowProps {
  onPreviewReady: () => void;
  isSplitView?: boolean;
}

export default function ChatFlow({ onPreviewReady, isSplitView = false }: ChatFlowProps) {
  const { state, dispatch } = usePresentation();
  const { sendMessage, generateStructure, generateSlides } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [phase, setPhase] = useState<'requirements' | 'structure' | 'generating' | 'done'>('requirements');
  const [isReadingDoc, setIsReadingDoc] = useState(false);
  const [readingStep, setReadingStep] = useState(0);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [isGeneratingStructure, setIsGeneratingStructure] = useState(false);
  const [structureStep, setStructureStep] = useState(0);
  const apiDoneRef = useRef(false);
  const [structureApiDone, setStructureApiDone] = useState(false);
  const [postStructureMessages, setPostStructureMessages] = useState<string[]>([]);
  const [doneMessageCount, setDoneMessageCount] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

  const GENERATION_STEPS = [
    { title: 'Изучаю тему и требования ...', subtitle: 'Немного подожди и мы продолжим' },
    { title: 'Анализирую структуру ...', subtitle: 'Это займёт совсем немного времени' },
    { title: 'Генерирую контент слайдов ...', subtitle: 'Основная часть работы' },
    { title: 'Подбираю визуальное оформление ...', subtitle: 'Добавляю финальные штрихи' },
    { title: 'Финальная сборка презентации ...', subtitle: 'Почти готово' },
  ];

  const READING_STEPS = [
    { title: 'Изучаю приложенный текст ...', subtitle: 'Немного подожди и мы продолжим' },
    { title: 'Анализирую содержание ...', subtitle: 'Это займёт совсем немного времени' },
    { title: 'Формирую ответ ...', subtitle: 'Почти готово' },
  ];

  const STRUCTURE_STEPS = [
    { title: 'Анализирую тему и требования ...', subtitle: 'Немного подожди и мы продолжим' },
    { title: 'Формирую структуру презентации ...', subtitle: 'Подбираю разделы и порядок' },
    { title: 'Финализирую структуру ...', subtitle: 'Почти готово' },
  ];

  useEffect(() => {
    if (!isReadingDoc) return;
    if (readingStep >= READING_STEPS.length - 1) {
      if (apiDoneRef.current) {
        const timer = setTimeout(() => setIsReadingDoc(false), 1500);
        return () => clearTimeout(timer);
      }
      return;
    }
    const timer = setTimeout(() => setReadingStep((s) => s + 1), 2500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadingDoc, readingStep]);

  useEffect(() => {
    if (!isReadingDoc) return;
    if (!state.isStreaming && readingStep > 0) {
      apiDoneRef.current = true;
      if (readingStep >= READING_STEPS.length - 1) {
        const timer = setTimeout(() => setIsReadingDoc(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isStreaming, isReadingDoc, readingStep]);

  useEffect(() => {
    if (phase !== 'generating') {
      setGeneratingStep(0);
      return;
    }
    if (generatingStep >= GENERATION_STEPS.length - 1) return;
    const timer = setTimeout(() => setGeneratingStep((s) => s + 1), 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, generatingStep]);

  useEffect(() => {
    if (!isGeneratingStructure) return;
    if (structureStep >= STRUCTURE_STEPS.length - 1) {
      if (structureApiDone) {
        const timer = setTimeout(() => setIsGeneratingStructure(false), 1500);
        return () => clearTimeout(timer);
      }
      return;
    }
    const timer = setTimeout(() => setStructureStep((s) => s + 1), 2500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGeneratingStructure, structureStep, structureApiDone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatMessages, postStructureMessages, phase]);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const hasTextAttachment = state.attachments.some((a) => a.type === 'text/plain');
    let initialMessage = hasTextAttachment
      ? 'Создай презентацию на основе введённого текста'
      : state.topic;
    if (state.attachments.length > 0) {
      const fileNames = state.attachments.map((a) => a.name).join(', ');
      if (initialMessage && !hasTextAttachment) {
        initialMessage += `\n\nПрикреплённые файлы: ${fileNames}`;
      } else if (!hasTextAttachment) {
        initialMessage = `Создай презентацию на основе прикреплённых файлов: ${fileNames}`;
      }
    }
    setIsReadingDoc(true);
    setReadingStep(0);
    apiDoneRef.current = false;
    sendMessage(initialMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyChanges = (changesJson: string) => {
    try {
      const changes = JSON.parse(changesJson);
      if (!Array.isArray(changes)) return;

      for (const change of changes) {
        switch (change.action) {
          case 'update_slide': {
            const idx = state.slides.findIndex(s => s.number === change.slideNumber);
            if (idx !== -1) {
              const updates: Partial<Slide> = {};
              if (change.title !== undefined) updates.title = change.title;
              if (change.content !== undefined) updates.content = change.content;
              if (change.layout !== undefined) updates.layout = change.layout;
              if (change.bullets !== undefined) updates.bullets = change.bullets;
              dispatch({ type: 'UPDATE_SLIDE', index: idx, slide: updates });
            }
            break;
          }
          case 'change_theme': {
            const theme = themes.find(t => t.id === change.themeId);
            if (theme) {
              dispatch({ type: 'SET_THEME', theme });
            }
            break;
          }
          case 'remove_slide': {
            const filtered = state.slides
              .filter(s => s.number !== change.slideNumber)
              .map((s, i) => ({ ...s, number: i + 1 }));
            dispatch({ type: 'SET_SLIDES', slides: filtered });
            break;
          }
          case 'add_slide': {
            const afterIdx = change.afterSlide
              ? state.slides.findIndex(s => s.number === change.afterSlide)
              : state.slides.length - 1;
            const newSlide: Slide = {
              id: crypto.randomUUID(),
              number: afterIdx + 2,
              title: change.title || 'Новый слайд',
              content: change.content || '',
              layout: change.layout || 'content',
            };
            const updated = [...state.slides];
            updated.splice(afterIdx + 1, 0, newSlide);
            dispatch({ type: 'SET_SLIDES', slides: updated.map((s, i) => ({ ...s, number: i + 1 })) });
            break;
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse changes:', e);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const msg = inputValue;
    setInputValue('');

    const response = await sendMessage(msg, phase);

    if (response) {
      if (phase === 'requirements' && response.includes('[READY]')) {
        dispatch({ type: 'UPDATE_LAST_MESSAGE', content: response.replace(/\n?\[READY\]/g, '').trim() });
        await handleConfirmSettings();
      }

      if (phase === 'done' && response.includes('[CHANGES]')) {
        const changesMatch = response.match(/\[CHANGES\]([\s\S]*?)\[\/CHANGES\]/);
        if (changesMatch) {
          applyChanges(changesMatch[1].trim());
          const cleanContent = response.replace(/\n?\[CHANGES\][\s\S]*?\[\/CHANGES\]/g, '').trim();
          dispatch({ type: 'UPDATE_LAST_MESSAGE', content: cleanContent });
        }
      }
    }
  };

  const handleConfirmSettings = async () => {
    setPhase('structure');
    setIsGeneratingStructure(true);
    setStructureStep(0);
    setStructureApiDone(false);

    dispatch({
      type: 'ADD_MESSAGE',
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Сейчас буду создавать структуру твоей работы. Ты можешь отредактировать её.',
        timestamp: Date.now(),
      },
    });

    const structure = await generateStructure();
    setStructureApiDone(true);
    if (structure) {
      dispatch({
        type: 'ADD_MESSAGE',
        message: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Структура готова! Ты можешь просмотреть и отредактировать её ниже.',
          timestamp: Date.now(),
        },
      });
    }
  };

  const handleGenerateSlides = async () => {
    setPhase('generating');

    const slides = await generateSlides();
    if (slides) {
      setPhase('done');
      setDoneMessageCount(state.chatMessages.length);

      const themeName = state.selectedTheme?.name || 'стандартном';
      const topicName = state.presentationTitle || state.topic || 'твоей теме';
      const slideCount = slides.length;

      const slideList = slides
        .map((s: { number: number; title: string; content?: string }) => {
          const brief = s.content ? s.content.slice(0, 80).replace(/\n/g, ' ') : '';
          return `${s.number}. **${s.title}**${brief ? ` — ${brief}${s.content && s.content.length > 80 ? '…' : ''}` : ''}`;
        })
        .join('\n');

      const fontFamily = state.selectedTheme?.fontFamily || 'Inter';
      const bgColor = state.selectedTheme?.colors.background || '#FFFFFF';
      const accentColor = state.selectedTheme?.colors.accent || '#000000';

      const summary = `Презентация успешно создана! 🎉

**Сводка**

Я создал презентацию в стиле «${themeName}» на основе темы «${topicName}». Презентация включает:

📊 **Структура (${slideCount} слайдов)**
${slideList}

🎨 **Визуальный стиль**
• Тема оформления: ${themeName}
• Типографика: ${fontFamily}
• Основной фон: ${bgColor}
• Акцентный цвет: ${accentColor}

Нажми на карточку справа, чтобы просмотреть, редактировать и скачать презентацию!`;

      setPostStructureMessages([
        summary,
        'Хочешь изменить презентацию? Просто напиши, что хочешь улучшить, и я сделаю это.',
      ]);

      onPreviewReady();
    }
  };

  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ol key={`list-${elements.length}`} className={styles.messageList}>
            {listItems.map((item, i) => {
              const match = item.match(/^\d+\.\s*\*\*(.*?)\*\*\s*(.*)/);
              if (match) {
                return (
                  <li key={i}>
                    <strong>{match[1]}</strong> {match[2]}
                  </li>
                );
              }
              return <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>;
            })}
          </ol>
        );
        listItems = [];
      }
    };

    lines.forEach((line, idx) => {
      if (/^\d+\.\s/.test(line.trim())) {
        listItems.push(line.trim());
      } else {
        flushList();
        if (line.trim()) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          if (parts.length > 1) {
            elements.push(
              <p key={`p-${idx}`}>
                {parts.map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                )}
              </p>
            );
          } else {
            elements.push(<p key={`p-${idx}`}>{line}</p>);
          }
        }
      }
    });
    flushList();

    return <div>{elements}</div>;
  };

  return (
    <div className={`${styles.container} ${isSplitView ? styles.containerInline : ''}`}>
      {state.attachments.length > 0 && (
        <div className={styles.messageGroup}>
          {state.attachments.map((att) => (
            <div key={att.id} className={styles.fileChip}>
              <div className={att.type === 'url' ? styles.fileChipLinkIcon : styles.fileChipIcon}>
                {att.type === 'url' ? '🔗' : att.type.includes('pdf') ? 'PDF' : att.type === 'text/plain' ? 'TXT' : '📎'}
              </div>
              <div className={styles.fileChipInfo}>
                <span className={styles.fileChipName}>{att.name}</span>
                {att.size > 0 && (
                  <span className={styles.fileChipSize}>
                    {(att.size / 1024 / 1024).toFixed(1)} Мб
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {state.chatMessages.map((msg, idx) => {
        if (doneMessageCount !== null && idx >= doneMessageCount) return null;
        if (isReadingDoc && msg.role === 'assistant' && idx === state.chatMessages.length - 1) {
          return null;
        }
        if (msg.role === 'user') {
          if (!msg.content.trim()) return null;
          return (
            <div key={msg.id} className={styles.userMessage}>
              <div className={styles.userBubble}>{msg.content}</div>
            </div>
          );
        }
        return (
          <div key={msg.id} className={styles.aiMessage}>
            <div className={styles.aiText}>
              {renderMessageContent(msg.content)}
            </div>
          </div>
        );
      })}

      {(state.isStreaming && !isReadingDoc && phase !== 'done') && (
        <div className={styles.aiMessage}>
          <div className={styles.typing}>
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
          </div>
        </div>
      )}

      {state.structure.length > 0 && (
        <>
          <StructureView
            structure={state.structure}
            onUpdate={(updated) => dispatch({ type: 'SET_STRUCTURE', structure: updated })}
            readonly={phase !== 'structure'}
          />
          {phase === 'structure' && (
            <button
              className={styles.generateBtn}
              onClick={handleGenerateSlides}
            >
              <span className={styles.generateBtnText}>
                Сгенерировать слайды
              </span>
              <FigmaIcon name="right-arrow" size={20} color="white" />
            </button>
          )}
        </>
      )}

      {postStructureMessages.map((msg, idx) => (
        <div key={`post-${idx}`} className={styles.aiMessage}>
          <div className={styles.aiText}>
            {renderMessageContent(msg)}
          </div>
        </div>
      ))}

      {doneMessageCount !== null && state.chatMessages.slice(doneMessageCount).map((msg) => {
        if (msg.role === 'user') {
          if (!msg.content.trim()) return null;
          return (
            <div key={msg.id} className={styles.userMessage}>
              <div className={styles.userBubble}>{msg.content}</div>
            </div>
          );
        }
        return (
          <div key={msg.id} className={styles.aiMessage}>
            <div className={styles.aiText}>
              {renderMessageContent(msg.content)}
            </div>
          </div>
        );
      })}

      {(state.isStreaming && phase === 'done') && (
        <div className={styles.aiMessage}>
          <div className={styles.typing}>
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      <div className={`${styles.inputArea} ${isSplitView ? styles.inputAreaInline : ''}`}>
        {isReadingDoc && (
          <LoadingInput
            image={
              (() => {
                const linkAtt = state.attachments.find((a) => a.type === 'url');
                if (linkAtt) {
                  let domain = '';
                  try {
                    domain = new URL(linkAtt.name).hostname;
                  } catch { domain = linkAtt.name; }
                  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                  return (
                    <div className={loadingStyles.thumbLink}>
                      <img src={favicon} alt="" className={loadingStyles.thumbLinkFavicon} />
                      <span className={loadingStyles.thumbLinkDomain}>{domain}</span>
                    </div>
                  );
                }
                const textAtt = state.attachments.find((a) => a.type === 'text/plain');
                if (textAtt) {
                  return (
                    <div className={loadingStyles.thumbText}>
                      <span className={loadingStyles.thumbTextLabel}>TXT</span>
                      <span className={loadingStyles.thumbTextPreview}>
                        {textAtt.content?.slice(0, 60)}...
                      </span>
                    </div>
                  );
                }
                const previewAtt = state.attachments.find((a) => a.previewUrl);
                if (previewAtt?.previewUrl) {
                  return <img src={previewAtt.previewUrl} alt={previewAtt.name} />;
                }
                if (state.selectedTheme) {
                  return (
                    <div
                      className={loadingStyles.thumbTheme}
                      style={{ backgroundColor: state.selectedTheme.colors.background }}
                    >
                      <span className={loadingStyles.thumbThemeName} style={{ color: state.selectedTheme.colors.text }}>
                        {state.selectedTheme.name}
                      </span>
                      <span className={loadingStyles.thumbThemeSub} style={{ color: state.selectedTheme.colors.text, opacity: 0.64 }}>
                        {state.selectedTheme.fontFamily}
                      </span>
                    </div>
                  );
                }
                return null;
              })()
            }
            steps={READING_STEPS}
            currentStep={readingStep}
          />
        )}
        {isGeneratingStructure && (
          <LoadingInput
            image={<img src="/structure-preview.png" alt="Structure" />}
            steps={STRUCTURE_STEPS}
            currentStep={structureStep}
          />
        )}
        {phase === 'generating' && state.selectedTheme && (
          <LoadingInput
            image={
              <div
                className={loadingStyles.thumbTheme}
                style={{ backgroundColor: state.selectedTheme.colors.background }}
              >
                <span className={loadingStyles.thumbThemeName} style={{ color: state.selectedTheme.colors.text }}>
                  {state.selectedTheme.name}
                </span>
                <span className={loadingStyles.thumbThemeSub} style={{ color: state.selectedTheme.colors.text, opacity: 0.64 }}>
                  {state.selectedTheme.fontFamily}
                </span>
              </div>
            }
            steps={GENERATION_STEPS}
            currentStep={generatingStep}
          />
        )}
        <div className={styles.inputWrapper}>
          <input
            className={styles.input}
            type="text"
            placeholder={
              phase === 'requirements'
                ? 'Введи свои требования к презентации здесь'
                : 'Улучшай работу с ИИ'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            className={`${styles.sendBtn} ${state.isStreaming || state.isGenerating ? styles.sendBtnLoading : ''}`}
            onClick={handleSend}
            disabled={!inputValue.trim() || state.isStreaming || state.isGenerating}
          >
            {state.isStreaming || state.isGenerating ? (
              <div className={styles.spinner} />
            ) : (
              <FigmaIcon name="send" size={20} color="white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
