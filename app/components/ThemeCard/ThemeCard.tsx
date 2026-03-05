'use client';

import { FigmaIcon } from '@campstudio/camp-ui-kit';
import styles from './ThemeCard.module.css';

interface ThemeCardProps {
  name: string;
  subtitle: string;
  backgroundColor: string;
  titleColor?: string;
  subtitleColor?: string;
  active?: boolean;
  onClick?: () => void;
}

export default function ThemeCard({
  name,
  subtitle,
  backgroundColor,
  titleColor = '#FFFFFF',
  subtitleColor = 'rgba(255,255,255,0.64)',
  active = false,
  onClick,
}: ThemeCardProps) {
  return (
    <div
      className={`${styles.root} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      <div
        className={styles.card}
        style={{ backgroundColor }}
      >
        <div className={styles.textGroup}>
          <span className={styles.name} style={{ color: titleColor }}>
            {name}
          </span>
          <span className={styles.subtitle} style={{ color: subtitleColor }}>
            {subtitle}
          </span>
        </div>

        {active && (
          <div className={styles.check}>
            <FigmaIcon name="check" size={12} color="white" />
          </div>
        )}
      </div>
    </div>
  );
}
