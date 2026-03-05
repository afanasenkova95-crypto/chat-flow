'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  PresentationState,
  PresentationAction,
} from '@/app/lib/types';
import { themes } from '@/app/lib/themes';

const defaultTheme = themes.find((t) => t.id === 'scandinavian') || null;

const initialState: PresentationState = {
  step: 'entry',
  topic: '',
  attachments: [],
  selectedTheme: defaultTheme,
  chatMessages: [],
  requirements: {},
  structure: [],
  slides: [],
  currentSlideIndex: 0,
  isGenerating: false,
  isStreaming: false,
  generationProgress: { current: 0, total: 0 },
  presentationTitle: '',
};

function presentationReducer(
  state: PresentationState,
  action: PresentationAction
): PresentationState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_TOPIC':
      return { ...state, topic: action.topic };
    case 'ADD_ATTACHMENT':
      return { ...state, attachments: [...state.attachments, action.attachment] };
    case 'REMOVE_ATTACHMENT':
      return {
        ...state,
        attachments: state.attachments.filter((a) => a.id !== action.id),
      };
    case 'SET_THEME':
      return { ...state, selectedTheme: action.theme };
    case 'ADD_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.message] };
    case 'UPDATE_LAST_MESSAGE': {
      const msgs = [...state.chatMessages];
      if (msgs.length > 0) {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: action.content };
      }
      return { ...state, chatMessages: msgs };
    }
    case 'SET_REQUIREMENTS':
      return { ...state, requirements: { ...state.requirements, ...action.requirements } };
    case 'SET_STRUCTURE':
      return { ...state, structure: action.structure };
    case 'SET_SLIDES':
      return { ...state, slides: action.slides };
    case 'UPDATE_SLIDE': {
      const slides = [...state.slides];
      slides[action.index] = { ...slides[action.index], ...action.slide };
      return { ...state, slides };
    }
    case 'SET_CURRENT_SLIDE':
      return { ...state, currentSlideIndex: action.index };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.isGenerating };
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.isStreaming };
    case 'SET_PROGRESS':
      return { ...state, generationProgress: action.progress };
    case 'SET_TITLE':
      return { ...state, presentationTitle: action.title };
    case 'ADD_SLIDE':
      return { ...state, slides: [...state.slides, action.slide] };
    case 'REORDER_SLIDES': {
      const slides = [...state.slides];
      const [removed] = slides.splice(action.fromIndex, 1);
      slides.splice(action.toIndex, 0, removed);
      return { ...state, slides: slides.map((s, i) => ({ ...s, number: i + 1 })) };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const PresentationContext = createContext<{
  state: PresentationState;
  dispatch: React.Dispatch<PresentationAction>;
} | null>(null);

export function PresentationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(presentationReducer, initialState);

  return (
    <PresentationContext.Provider value={{ state, dispatch }}>
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentation() {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentation must be used within a PresentationProvider');
  }
  return context;
}
