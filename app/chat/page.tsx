'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePresentation } from '@/app/context/PresentationContext';
import Header from '@/app/components/Header/Header';
import ChatFlow from '@/app/components/ChatFlow/ChatFlow';
import PreviewPanel from '@/app/components/PreviewPanel/PreviewPanel';
import styles from './page.module.css';

export default function ChatPage() {
  const router = useRouter();
  const { state, dispatch } = usePresentation();
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!state.topic && state.attachments.length === 0) {
      router.push('/');
    }
  }, [state.topic, state.attachments.length, router]);

  if (!state.topic && state.attachments.length === 0) {
    return null;
  }

  const handlePreviewReady = () => {
    setShowPreview(true);
  };

  const handleEdit = () => {
    dispatch({ type: 'SET_STEP', step: 'editor' });
    router.push('/editor');
  };

  return (
    <>
      <Header />
      <div className={styles.divider} />
      <main className={`${styles.main} ${showPreview ? styles.splitView : ''}`}>
        <div className={showPreview ? styles.chatPane : styles.chatFull}>
          <ChatFlow onPreviewReady={handlePreviewReady} isSplitView={showPreview} />
        </div>
        {showPreview && state.slides.length > 0 && (
          <div className={styles.previewPane}>
            <PreviewPanel onEdit={handleEdit} />
          </div>
        )}
      </main>
    </>
  );
}
