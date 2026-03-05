'use client';

import { useState } from 'react';
import { FigmaIcon } from '@campstudio/camp-ui-kit';
import styles from './EditorChatPopup.module.css';

interface EditorChatPopupProps {
  onClose: () => void;
}

const quickActions = [
  { label: 'Обновить макет', icon: <FigmaIcon name="view-grid" size={16} color="#232323" /> },
  { label: 'Сделать короче', icon: <FigmaIcon name="up-chevron" size={16} color="#232323" /> },
  { label: 'Больше текста', icon: <FigmaIcon name="pencil" size={16} color="#232323" /> },
  { label: 'Изменить визуал', icon: <FigmaIcon name="picture" size={16} color="#232323" /> },
];

export default function EditorChatPopup({ onClose }: EditorChatPopupProps) {
  const [input, setInput] = useState('');

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Я твой ИИ помощник в редактировании</span>
        <button className={styles.closeBtn} onClick={onClose}>
          <FigmaIcon name="close" size={20} color="#232323" />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.inputSection}>
          <textarea
            className={styles.chatInput}
            placeholder="Напиши или скажи, что улучшить"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className={styles.inputActions}>
            <button className={styles.micBtn}>
              <FigmaIcon name="microphone" size={20} color="#232323" />
            </button>
            <button className={styles.sendBtn}>
              <FigmaIcon name="send" size={20} color="white" />
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>Доработка макета</span>
          <span className={styles.sectionSubtitle}>Улучши слайд, содержание или визуал</span>
          <div className={styles.quickActions}>
            {quickActions.map((action) => (
              <button key={action.label} className={styles.quickBtn}>
                {action.label}
                <span className={styles.quickBtnIcon}>{action.icon}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.redesignSection}>
          <span className={styles.sectionTitle}>Редизайн</span>
          <span className={styles.sectionSubtitle}>Преобразуй всю презентацию с новой темой</span>
          <button className={styles.redesignBtn}>
            Изменить тему
            <FigmaIcon name="palette" size={16} color="#232323" />
          </button>
        </div>
      </div>
    </div>
  );
}
