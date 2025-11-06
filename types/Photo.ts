
export interface Photo {
  id: string;
  uris: string[]; // Changed from single uri to array of uris
  eventName: string;
  description?: string; // New field for description
  date: Date;
  frame: FrameType;
  createdAt: Date;
  songUri?: string; // New field for song
  songName?: string; // New field for song name
  imageAdjustments?: ImageAdjustments[]; // Adjustments for each image
}

export interface ImageAdjustments {
  scale: number;
  translateX: number;
  translateY: number;
}

export type FrameType = 'hearts' | 'roses' | 'classic' | 'elegant' | 'vintage';

export interface FrameStyle {
  name: string;
  color: string;
  icon: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  emoji?: string; // Optional emoji for enhanced frame styles
}
