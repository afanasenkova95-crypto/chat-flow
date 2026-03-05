'use client';

import { useState } from 'react';
import { FigmaIcon } from '@campstudio/camp-ui-kit';
import { usePresentation } from '@/app/context/PresentationContext';
import SlideRenderer from '@/app/components/PreviewPanel/SlideRenderer';
import EditorChatPopup from '@/app/components/EditorChatPopup/EditorChatPopup';
import styles from './EditorView.module.css';

const toolbarIconNames = [
  'picture',
  'stacked-bar-chart',
  'table-large',
  'shape-plus',
  'text-fields',
  'view-grid',
  'texture',
];

export default function EditorView() {
  const { state, dispatch } = usePresentation();
  const [showChat, setShowChat] = useState(false);

  const currentSlide = state.slides[state.currentSlideIndex];

  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Слайды</span>
          <span className={styles.sidebarCount}>{state.slides.length}</span>
        </div>
        <div className={styles.slidesList}>
          {state.slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`${styles.slideThumb} ${index === state.currentSlideIndex ? styles.slideThumbActive : ''}`}
              onClick={() => dispatch({ type: 'SET_CURRENT_SLIDE', index })}
            >
              <SlideRenderer
                slide={slide}
                theme={state.selectedTheme}
                width={180}
              />
              <div className={styles.thumbBadge}>{index + 1}</div>
            </div>
          ))}
        </div>
        <button className={styles.newSlideBtn}>
          <FigmaIcon name="plus" size={20} color="#232323" />
          <span className={styles.newSlideBtnText}>Новый слайд</span>
        </button>
      </div>

      <div className={styles.mainArea}>
        {currentSlide && (
          <>
            <div className={styles.mainSlide}>
              <SlideRenderer
                slide={currentSlide}
                theme={state.selectedTheme}
                width={900}
              />
            </div>
            <p className={styles.mainCaption}>
              Часть изображений была сгенерирована ИИ — советуем проверять перед сдачей
            </p>
          </>
        )}

        <div className={styles.bottomToolbar}>
          <div className={styles.toolbarBar}>
            {toolbarIconNames.map((name) => (
              <button key={name} className={styles.toolbarBtn}>
                <FigmaIcon name={name} size={20} color="#232323" />
              </button>
            ))}
          </div>
          <button
            className={styles.aiBtn}
            onClick={() => setShowChat(!showChat)}
          >
            <FigmaIcon name="auto-fix" size={24} color="white" />
          </button>
        </div>
      </div>

      {showChat && (
        <EditorChatPopup onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}
