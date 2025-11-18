import type { Dispatch, SetStateAction, ReactNode } from "react";
import { createContext, useState, useContext, useRef } from "react";

export interface Track {
  title: string;
  src: string;
  author: string;
  thumbnail?: string;
}

interface AudioPlayerContextType {
  currentTrack: Track;
  setCurrentTrack: Dispatch<SetStateAction<Track>>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const contextValue = {
    currentTrack,
    setCurrentTrack,
    audioRef,
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
