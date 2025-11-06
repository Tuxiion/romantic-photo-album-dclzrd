
import { FrameStyle, FrameType } from '@/types/Photo';

export const frames: Record<FrameType, FrameStyle> = {
  hearts: {
    name: 'Hearts',
    color: '#FF4081',
    icon: 'heart.fill',
    borderStyle: 'solid',
  },
  roses: {
    name: 'Roses',
    color: '#E91E63',
    icon: 'leaf.fill',
    borderStyle: 'solid',
    emoji: '🌹',
  },
  classic: {
    name: 'Classic',
    color: '#9C27B0',
    icon: 'square.fill',
    borderStyle: 'solid',
    emoji: '🦋',
  },
  elegant: {
    name: 'Elegant',
    color: '#FFCDD2',
    icon: 'sparkles',
    borderStyle: 'dashed',
  },
  vintage: {
    name: 'Vintage',
    color: '#777777',
    icon: 'camera.fill',
    borderStyle: 'dotted',
  },
};
