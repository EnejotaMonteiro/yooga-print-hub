import React, { createContext, useState, useContext, ReactNode } from 'react';

interface VideoPlayerContextType {
  videoUrl: string | null;
  videoTitle: string | null;
  playVideo: (url: string, title: string) => void;
  closeVideo: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export const VideoPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);

  const playVideo = (url: string, title: string) => {
    setVideoUrl(url);
    setVideoTitle(title);
  };

  const closeVideo = () => {
    setVideoUrl(null);
    setVideoTitle(null);
  };

  return (
    <VideoPlayerContext.Provider value={{ videoUrl, videoTitle, playVideo, closeVideo }}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = () => {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
};