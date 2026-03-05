export interface Theme {
  id: string;
  name: string;
  subtitle: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  cardColors?: {
    leftPanel: string;
    rightTop: string;
    rightBottom: string;
    leftPanelImage?: string;
    titleColor?: string;
    bodyColor?: string;
  };
  fontFamily: string;
}

export interface SlideStructure {
  number: number;
  title: string;
  tag?: string;
  description: string;
}

export interface Slide {
  id: string;
  number: number;
  title: string;
  content: string;
  layout: 'title' | 'content' | 'two-column' | 'image-text' | 'bullets' | 'quote';
  bullets?: string[];
  imagePrompt?: string;
  imageUrl?: string;
  tag?: string;
}

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Requirements {
  language: string;
  slideCount: number;
  audience: string;
  useCase: string;
  narrativeStyle: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  previewUrl?: string;
}

export type FlowStep = 'entry' | 'chat' | 'preview' | 'editor';

export interface PresentationState {
  step: FlowStep;
  topic: string;
  attachments: Attachment[];
  selectedTheme: Theme | null;
  chatMessages: ChatMessageData[];
  requirements: Partial<Requirements>;
  structure: SlideStructure[];
  slides: Slide[];
  currentSlideIndex: number;
  isGenerating: boolean;
  isStreaming: boolean;
  generationProgress: { current: number; total: number };
  presentationTitle: string;
}

export type PresentationAction =
  | { type: 'SET_STEP'; step: FlowStep }
  | { type: 'SET_TOPIC'; topic: string }
  | { type: 'ADD_ATTACHMENT'; attachment: Attachment }
  | { type: 'REMOVE_ATTACHMENT'; id: string }
  | { type: 'SET_THEME'; theme: Theme }
  | { type: 'ADD_MESSAGE'; message: ChatMessageData }
  | { type: 'UPDATE_LAST_MESSAGE'; content: string }
  | { type: 'SET_REQUIREMENTS'; requirements: Partial<Requirements> }
  | { type: 'SET_STRUCTURE'; structure: SlideStructure[] }
  | { type: 'SET_SLIDES'; slides: Slide[] }
  | { type: 'UPDATE_SLIDE'; index: number; slide: Partial<Slide> }
  | { type: 'SET_CURRENT_SLIDE'; index: number }
  | { type: 'SET_GENERATING'; isGenerating: boolean }
  | { type: 'SET_STREAMING'; isStreaming: boolean }
  | { type: 'SET_PROGRESS'; progress: { current: number; total: number } }
  | { type: 'SET_TITLE'; title: string }
  | { type: 'ADD_SLIDE'; slide: Slide }
  | { type: 'REORDER_SLIDES'; fromIndex: number; toIndex: number }
  | { type: 'RESET' };
