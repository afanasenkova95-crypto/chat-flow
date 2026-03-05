'use client';

import { Slide, Theme } from '@/app/lib/types';
import styles from './SlideRenderer.module.css';

interface SlideRendererProps {
  slide: Slide;
  theme: Theme | null;
  width?: number;
  height?: number;
  className?: string;
}

export default function SlideRenderer({
  slide,
  theme,
  width,
  height,
  className = '',
}: SlideRendererProps) {
  const colors = theme?.colors || {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    background: '#1A1A2E',
    text: '#FFFFFF',
    accent: '#4A90D9',
  };

  const slideHeight = height || (width ? width * (9 / 16) : undefined);

  const renderContent = () => {
    switch (slide.layout) {
      case 'title':
        return (
          <div className={styles.titleSlide}>
            <h2 className={styles.slideTitle} style={{ color: colors.text }}>
              {slide.title}
            </h2>
            {slide.content && (
              <p className={styles.slideSubtitle} style={{ color: colors.text, opacity: 0.8 }}>
                {slide.content}
              </p>
            )}
          </div>
        );

      case 'bullets':
        return (
          <div className={styles.bulletsSlide}>
            <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
              {slide.title}
            </h3>
            <ul className={styles.bulletList}>
              {(slide.bullets || slide.content.split('\n').filter(Boolean)).map((item, i) => (
                <li key={i} className={styles.bulletItem} style={{ color: colors.text }}>
                  <span className={styles.bulletDot} style={{ background: colors.accent }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'image-text':
        return (
          <div className={styles.imageTextSlide}>
            <div className={styles.imageTextImage}>
              {slide.imageUrl ? (
                <img src={slide.imageUrl} alt={slide.title} className={styles.slideImage} />
              ) : (
                <div className={styles.imagePlaceholder} style={{ background: colors.accent, opacity: 0.15 }} />
              )}
            </div>
            <div className={styles.imageTextContent}>
              <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
                {slide.title}
              </h3>
              <p className={styles.contentText} style={{ color: colors.text, opacity: 0.85 }}>
                {slide.content}
              </p>
            </div>
          </div>
        );

      case 'two-column':
        return (
          <div className={styles.twoColumnSlide}>
            <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
              {slide.title}
            </h3>
            <div className={styles.columns}>
              <div className={styles.column}>
                <p style={{ color: colors.text, opacity: 0.9 }}>
                  {slide.content}
                </p>
              </div>
              <div
                className={styles.column}
                style={{ background: colors.accent, opacity: 0.15, borderRadius: 8 }}
              />
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className={styles.quoteSlide}>
            <div className={styles.quoteDecor} style={{ color: colors.accent }}>
              &ldquo;
            </div>
            <p className={styles.quoteText} style={{ color: colors.text }}>
              {slide.content}
            </p>
            <span className={styles.quoteAuthor} style={{ color: colors.text, opacity: 0.6 }}>
              {slide.title}
            </span>
          </div>
        );

      default:
        return (
          <div className={styles.contentSlide}>
            <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
              {slide.title}
            </h3>
            <p className={styles.contentText} style={{ color: colors.text, opacity: 0.85 }}>
              {slide.content}
            </p>
          </div>
        );
    }
  };

  const fillParent = !width && !height;

  return (
    <div
      className={`${styles.slide} ${className}`}
      style={{
        ...(fillParent
          ? { width: '100%', height: '100%' }
          : { width, height: slideHeight }),
        background: colors.background,
        fontFamily: theme?.fontFamily || 'Inter, sans-serif',
      }}
    >
      {renderContent()}
      <div className={styles.slideNumber} style={{ color: colors.text, opacity: 0.4 }}>
        {slide.number}
      </div>
    </div>
  );
}
