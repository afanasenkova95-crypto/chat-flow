'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { FigmaIcon } from '@campstudio/camp-ui-kit';
import { usePresentation } from '@/app/context/PresentationContext';
import { themes } from '@/app/lib/themes';
import ThemeCard from '@/app/components/ThemeCard/ThemeCard';
import styles from './EntryScreen.module.css';

interface EntryScreenProps {
  onContinue: () => void;
}

export default function EntryScreen({ onContinue }: EntryScreenProps) {
  const { state, dispatch } = usePresentation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const id = crypto.randomUUID();

      dispatch({
        type: 'ADD_ATTACHMENT',
        attachment: { id, name: file.name, size: file.size, type: file.type },
      });

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/extract-text', { method: 'POST', body: formData });
        if (res.ok) {
          const { text, preview } = await res.json();
          if (text || preview) {
            dispatch({ type: 'REMOVE_ATTACHMENT', id });
            dispatch({
              type: 'ADD_ATTACHMENT',
              attachment: {
                id,
                name: file.name,
                size: file.size,
                type: file.type,
                content: text || undefined,
                previewUrl: preview || undefined,
              },
            });
          }
        }
      } catch {
        // keep attachment without content
      }
    }
  };

  const canContinue = state.topic.trim().length > 0 || state.attachments.length > 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.divider} />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>
              Давай создадим презентацию вместе
            </h1>
            <p className={styles.description}>
              Укажи тему, добавь текст или загрузи ссылку
            </p>
          </div>

          <div className={styles.inputCard}>
            <div className={`${styles.textAreaWrapper} ${state.attachments.length > 0 ? styles.textAreaWrapperExpanded : ''}`}>
              {state.attachments.length > 0 && (
                <div className={styles.attachmentsInInput}>
                  {state.attachments.map((att) => (
                    <div key={att.id} className={styles.attachmentChip}>
                      <div className={att.type === 'url' ? styles.chipLinkIcon : styles.chipFileIcon}>
                        {att.type === 'url' ? '🔗' : att.type.includes('pdf') ? 'PDF' : att.type === 'text/plain' ? 'TXT' : '📎'}
                      </div>
                      <div className={styles.chipInfo}>
                        <span className={styles.chipName}>{att.name}</span>
                        <span className={styles.chipSize}>
                          {att.size > 0
                            ? att.size > 1024 * 1024
                              ? `${(att.size / 1024 / 1024).toFixed(1)} Мб`
                              : `${(att.size / 1024).toFixed(1)} Кб`
                            : 'ссылка'}
                        </span>
                      </div>
                      <button
                        className={styles.chipRemove}
                        onClick={() => dispatch({ type: 'REMOVE_ATTACHMENT', id: att.id })}
                      >
                        <FigmaIcon name="close" size={12} color="white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <textarea
                className={styles.textArea}
                placeholder="Введи тему и требования к презентации"
                value={state.topic}
                onChange={(e) => dispatch({ type: 'SET_TOPIC', topic: e.target.value })}
              />
              <div className={styles.inputActions}>
                <button
                  className={styles.actionBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className={styles.actionBtnText}>Загрузить файл</span>
                  <FigmaIcon name="upload" size={24} color="#232323" />
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => setShowLinkPopover(true)}
                >
                  <span className={styles.actionBtnText}>Прикрепить ссылку</span>
                  <FigmaIcon name="link-variant" size={24} color="#232323" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className={styles.hiddenInput}
                accept=".pdf,.doc,.docx,.txt,.pptx"
                onChange={handleFileUpload}
                multiple
              />
            </div>

            <div className={styles.themeCard}>
              <div className={styles.themeHeader}>
                <span className={styles.themeLabel}>Дизайн презентации</span>
              </div>

              <div className={styles.themeGrid}>
                {themes.map((theme) => {
                  const isSelected = state.selectedTheme?.id === theme.id;
                  const card = theme.cardColors;

                  return (
                    <ThemeCard
                      key={theme.id}
                      name={theme.name}
                      subtitle={theme.subtitle}
                      backgroundColor={card?.leftPanel || theme.colors.background}
                      titleColor={card?.titleColor || theme.colors.text}
                      subtitleColor={card?.bodyColor || 'rgba(255,255,255,0.64)'}
                      active={isSelected}
                      onClick={() => dispatch({ type: 'SET_THEME', theme })}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {canContinue && (
          <div className={styles.bottomNav}>
            <button
              className={styles.continueBtn}
              onClick={() => {
                if (state.topic.length > 300) {
                  const textContent = state.topic;
                  dispatch({
                    type: 'ADD_ATTACHMENT',
                    attachment: {
                      id: crypto.randomUUID(),
                      name: 'Введённый текст',
                      size: new Blob([textContent]).size,
                      type: 'text/plain',
                      content: textContent,
                    },
                  });
                }
                onContinue();
              }}
            >
              <span className={styles.continueBtnText}>Продолжить</span>
              <FigmaIcon name="right-arrow" size={24} color="white" />
            </button>
          </div>
        )}
      </div>

      {showLinkPopover && (
        <div className={styles.overlay} onClick={() => setShowLinkPopover(false)}>
          <div className={styles.popover} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popoverNav}>
              <button
                className={styles.popoverClose}
                onClick={() => setShowLinkPopover(false)}
              >
                <FigmaIcon name="close" size={24} color="#232323" />
              </button>
            </div>
            <div className={styles.popoverDialog}>
              <div className={styles.popoverContent}>
                <div className={styles.popoverMain}>
                  <Image
                    src="/link-icon.png"
                    alt=""
                    width={88}
                    height={88}
                    className={styles.popoverIcon}
                  />
                  <div className={styles.popoverTextBlock}>
                    <div className={styles.popoverTitleGroup}>
                      <h2 className={styles.popoverTitle}>
                        Прикрепи ссылку на файл
                      </h2>
                      <p className={styles.popoverSubtitle}>
                        С этого шага начнём собирать основу
                      </p>
                    </div>
                    <input
                      className={styles.popoverInput}
                      type="url"
                      placeholder="http://www.example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  className={styles.popoverSubmit}
                  onClick={() => {
                    if (linkUrl.trim()) {
                      dispatch({
                        type: 'ADD_ATTACHMENT',
                        attachment: {
                          id: crypto.randomUUID(),
                          name: linkUrl.trim(),
                          size: 0,
                          type: 'url',
                        },
                      });
                      setLinkUrl('');
                      setShowLinkPopover(false);
                    }
                  }}
                >
                  Продолжить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
