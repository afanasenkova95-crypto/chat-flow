'use client';

import { useEffect } from 'react';

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Chat page error:', error);
  }, [error]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 500 }}>Что-то пошло не так</h2>
      <p style={{ color: '#7a7f82' }}>{error.message}</p>
      <button
        onClick={reset}
        style={{
          padding: '12px 24px',
          background: '#232323',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Попробовать снова
      </button>
    </div>
  );
}
