'use client';

import { Theme } from '@/app/lib/types';
import styles from './LoadingStatus.module.css';

interface LoadingStatusProps {
  theme: Theme | null;
  message: string;
  submessage?: string;
  progress?: { current: number; total: number };
}

export default function LoadingStatus({
  theme,
  message,
  submessage,
  progress,
}: LoadingStatusProps) {
  return (
    <div className={styles.container}>
      {theme && (
        <div
          className={styles.themePreview}
          style={{ background: theme.colors.background }}
        >
          <span style={{ color: theme.colors.text, fontSize: 10, fontWeight: 500 }}>
            {theme.name}
          </span>
          <span style={{ color: theme.colors.text, fontSize: 8, opacity: 0.7 }}>
            {theme.subtitle}
          </span>
        </div>
      )}
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
        {submessage && <span className={styles.submessage}>{submessage}</span>}
      </div>
      {progress && progress.total > 0 && (
        <span className={styles.progress}>
          {progress.current}/{progress.total}
        </span>
      )}
    </div>
  );
}
