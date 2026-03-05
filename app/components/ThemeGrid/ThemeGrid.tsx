'use client';

import { FigmaIcon } from '@campstudio/camp-ui-kit';
import { Theme } from '@/app/lib/types';
import styles from './ThemeGrid.module.css';

interface ThemeGridProps {
  themes: Theme[];
  selectedTheme: Theme | null;
  onSelect: (theme: Theme) => void;
}

export default function ThemeGrid({ themes, selectedTheme, onSelect }: ThemeGridProps) {
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <span className={styles.label}>Дизайн презентации</span>
      </div>
      <div className={styles.grid}>
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`${styles.themeCard} ${selectedTheme?.id === theme.id ? styles.selected : ''}`}
            style={{ background: theme.colors.background }}
            onClick={() => onSelect(theme)}
          >
            <span
              className={styles.themeName}
              style={{ color: theme.colors.text }}
            >
              {theme.name}
            </span>
            <span
              className={styles.themeSubtitle}
              style={{ color: theme.colors.text, opacity: 0.7 }}
            >
              {theme.subtitle}
            </span>
            {selectedTheme?.id === theme.id && (
              <div className={styles.checkmark}>
                <FigmaIcon name="check-circle" size={16} color="var(--camp-black-1, #232323)" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
