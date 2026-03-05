'use client';

import { useRouter } from 'next/navigation';
import { usePresentation } from '@/app/context/PresentationContext';
import Header from '@/app/components/Header/Header';
import EntryScreen from '@/app/components/EntryScreen/EntryScreen';

export default function Home() {
  const router = useRouter();
  const { dispatch } = usePresentation();

  const handleContinue = () => {
    dispatch({ type: 'SET_STEP', step: 'chat' });
    router.push('/chat');
  };

  return (
    <>
      <Header />
      <main>
        <EntryScreen onContinue={handleContinue} />
      </main>
    </>
  );
}
