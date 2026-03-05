'use client';

import { useState } from 'react';
import { FigmaIcon } from '@campstudio/camp-ui-kit';
import styles from './LoadingInput.module.css';

export interface LoadingInputStep {
  title: string;
  subtitle: string;
}

interface LoadingInputProps {
  image: React.ReactNode;
  steps: LoadingInputStep[];
  currentStep: number;
}

export default function LoadingInput({ image, steps, currentStep }: LoadingInputProps) {
  const [expanded, setExpanded] = useState(false);
  const step = steps[currentStep] || steps[steps.length - 1];

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.thumb}>
          {image}
        </div>
        <div className={styles.content}>
          <span className={styles.title}>{step.title}</span>
          <span className={styles.subtitle}>{step.subtitle}</span>
        </div>
        <div className={styles.right}>
          <span className={styles.progress}>
            {currentStep + 1}/{steps.length}
          </span>
          <FigmaIcon
            name={expanded ? 'up-chevron' : 'down-chevron'}
            size={24}
            color="#7a7f82"
          />
        </div>
      </div>

      {expanded && (
        <div className={styles.steps}>
          {steps.map((s, index) => {
            const isDone = index < currentStep;
            const isActive = index === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={index} className={styles.stepRow}>
                <div className={styles.stepIndicator}>
                  <div
                    className={`${styles.stepDot} ${isDone ? styles.stepDotDone : ''} ${isActive ? styles.stepDotActive : ''}`}
                  />
                  {!isLast && (
                    <div
                      className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`}
                    />
                  )}
                </div>
                <span
                  className={`${styles.stepLabel} ${isDone ? styles.stepLabelDone : ''} ${isActive ? styles.stepLabelActive : ''}`}
                >
                  {s.title.replace(' ...', '')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
