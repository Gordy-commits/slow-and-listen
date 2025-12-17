export type CardType = 'STORY' | 'QUOTE';

export interface Story {
  id: string;
  type: CardType;
  title: string;
  author?: string;
  avatarUrl: string; // URL for the headshot
  excerpt: string;
  content: string; // Full content for modal
  date: string;
}

export interface Insight {
  id: string;
  title: string;
  text: string;
  iconName: 'Ear' | 'Wind' | 'Music' | 'Heart';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface ImageGenerationConfig {
  prompt: string;
  size: ImageSize;
}
