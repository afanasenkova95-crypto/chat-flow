'use client';

import Link from 'next/link';
import { FigmaIcon } from '@campstudio/camp-ui-kit';
import { usePresentation } from '@/app/context/PresentationContext';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
  rightContent?: React.ReactNode;
}

export default function Header({
  title,
  subtitle,
  showTitle = false,
  rightContent,
}: HeaderProps) {
  const { dispatch } = usePresentation();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo} onClick={() => dispatch({ type: 'RESET' })}>
            <svg width="44" height="44" viewBox="0 0 61 61" fill="none">
              <path d="M0.29 22.57C0.29 14.88 0.29 11.03 1.79 8.09C3.11 5.5 5.21 3.4 7.8 2.08C10.74 0.58 14.58 0.58 22.28 0.58H38.43C46.13 0.58 49.97 0.58 52.91 2.08C55.5 3.4 57.6 5.5 58.92 8.09C60.42 11.03 60.42 14.88 60.42 22.57V38.72C60.42 46.42 60.42 50.26 58.92 53.2C57.6 55.79 55.5 57.89 52.91 59.21C49.97 60.71 46.13 60.71 38.43 60.71H22.28C14.58 60.71 10.74 60.71 7.8 59.21C5.21 57.89 3.11 55.79 1.79 53.2C0.29 50.26 0.29 46.42 0.29 38.72V22.57Z" fill="#F2F6F8"/>
              <path d="M16.13 19.22C16.13 17.64 17.41 16.36 18.99 16.36H41.81C44.35 16.36 45.62 19.43 43.83 21.23L36.49 28.63C35.38 29.75 35.38 31.54 36.49 32.66L43.83 40.06C45.62 41.86 44.35 44.93 41.81 44.93H18.99C17.41 44.93 16.13 43.65 16.13 42.07V19.22Z" fill="#232323"/>
            </svg>
          </Link>
          {showTitle && title && (
            <div className={styles.titleWrapper}>
              <span className={styles.title}>{title}</span>
              {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
            </div>
          )}
        </div>
        <div className={styles.right}>
          {rightContent || (
            <div className={styles.headerButtons}>
              <button className={styles.iconBtn}>
                <FigmaIcon name="headphones" size={20} color="#232323" />
              </button>
              {/* Balance button — show after authorization */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
