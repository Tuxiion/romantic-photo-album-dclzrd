
export interface Photo {
  id: string;
  uris: string[]; // Changed from single uri to array of uris
  eventName: string;
  date: Date;
  frame: FrameType;
  createdAt: Date;
}

export type FrameType = 'hearts' | 'roses' | 'classic' | 'elegant' | 'vintage';

export interface FrameStyle {
  name: string;
  color: string;
  icon: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
}
