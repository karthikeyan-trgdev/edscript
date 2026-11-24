import { BrainCircuit, Megaphone, Mic, PenLine, Smartphone, Video } from 'lucide-react';

// Program images are picked up from assets/images/programs by file name
// (see content.json → programs.items[].image)
const images = import.meta.glob('@assets/images/programs/*.{webp,jpg,jpeg,png}', { eager: true, import: 'default' });
export const imageFor = (file) => {
  const key = Object.keys(images).find((k) => k.endsWith(`/${file}`));
  return key ? images[key] : undefined;
};

export const programIcons = {
  video: Video,
  megaphone: Megaphone,
  smartphone: Smartphone,
  pen: PenLine,
  mic: Mic,
  brain: BrainCircuit,
};
