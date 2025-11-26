import type { Dispatch, SetStateAction, ReactNode } from "react";
import { createContext, useState, useContext, useRef } from "react";

export interface Track {
  id?: number;
  title: string;
  src: string;
  author: string;
  thumbnail?: string;
}

interface AudioPlayerContextType {
  currentTrack: Track;
  setCurrentTrack: Dispatch<SetStateAction<Track>>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track>({
    title: "",
    src: "",
    author: "",
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const contextValue = {
    currentTrack,
    setCurrentTrack,
    audioRef,
    isPlaying,
    setIsPlaying,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayerContext = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayerContext must be used within an AudioPlayerProvider"
    );
  }
  return context;
};
