// Music tracks available in the app
export interface MusicTrack {
  id: string;
  title: string;
  src: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'the-only-thing',
    title: 'The Only Thing They Fear Is You',
    src: '/doom-assets/music/Doom Eternal - The Only Thing They Fear Is You.mp3',
  },
];

export function getRandomTrack(): MusicTrack {
  return MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];
}
