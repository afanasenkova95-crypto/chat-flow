'use client';

import { useState } from 'react';
import { FigmaIcon } from '@campstudio/camp-ui-kit';
import { usePresentation } from '@/app/context/PresentationContext';
import SlideRenderer from './SlideRenderer';
import Slideshow from './Slideshow';
import styles from './PreviewPanel.module.css';

interface PreviewPanelProps {
  onEdit: () => void;
}

export default function PreviewPanel({ onEdit }: PreviewPanelProps) {
  const { state } = usePresentation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSlideshow, setShowSlideshow] = useState(false);

  const presentationTitle = state.presentationTitle || state.topic || 'Презентация';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <p className={styles.title}>{presentationTitle}</p>
          <p className={styles.subtitle}>тема презентации</p>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${styles.actionBtnWithText}`} onClick={onEdit}>
            <span>Редактировать</span>
            <FigmaIcon name="pencil" size={20} color="#232323" />
          </button>
          <button className={`${styles.actionBtn} ${styles.actionBtnGrey}`} onClick={() => setShowSlideshow(true)}>
            <FigmaIcon name="play" size={20} color="#232323" />
          </button>
          <button className={`${styles.actionBtn} ${styles.primaryActionBtn}`}>
            <FigmaIcon name="download" size={20} color="white" />
          </button>
        </div>
      </div>

      {state.slides[selectedIndex] && (
        <div className={styles.mainSlide}>
          <SlideRenderer
            slide={state.slides[selectedIndex]}
            theme={state.selectedTheme}
          />
        </div>
      )}

      <div className={styles.slidesList}>
        {state.slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`${styles.slideCard} ${index === selectedIndex ? styles.slideCardActive : ''}`}
            onClick={() => setSelectedIndex(index)}
          >
            <div className={styles.numberBadge}>{index + 1}</div>
            <SlideRenderer
              slide={slide}
              theme={state.selectedTheme}
            />
          </div>
        ))}
      </div>
      {showSlideshow && (
        <Slideshow
          slides={state.slides}
          theme={state.selectedTheme}
          startIndex={selectedIndex}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </div>
  );
}
