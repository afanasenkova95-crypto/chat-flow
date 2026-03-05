'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Slide, Theme } from '@/app/lib/types';
import SlideRenderer from './SlideRenderer';
import styles from './Slideshow.module.css';

interface SlideshowProps {
  slides: Slide[];
  theme: Theme | null;
  startIndex?: number;
  onClose: () => void;
}

export default function Slideshow({ slides, theme, startIndex = 0, onClose }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const slide = slides[currentIndex];
  if (!slide || !mounted) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.slideContainer} onClick={(e) => e.stopPropagation()}>
        <SlideRenderer slide={slide} theme={theme} />
      </div>

      <div className={styles.counter}>
        {currentIndex + 1} / {slides.length}
      </div>

      <button
        className={styles.closeBtn}
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>

      {currentIndex > 0 && (
        <button className={`${styles.navBtn} ${styles.navBtnPrev}`} onClick={goPrev}>
          ‹
        </button>
      )}
      {currentIndex < slides.length - 1 && (
        <button className={`${styles.navBtn} ${styles.navBtnNext}`} onClick={goNext}>
          ›
        </button>
      )}
    </div>,
    document.body
  );
}
