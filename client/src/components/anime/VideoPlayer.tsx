import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  streamUrl: string;
  onEnded: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ streamUrl, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        videoRef.current.play();
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = streamUrl;
        videoRef.current.play();
      }
    }

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('ended', onEnded);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (videoElement) {
        videoElement.removeEventListener('ended', onEnded);
      }
    };
  }, [streamUrl, onEnded]);

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video ref={videoRef} controls className="w-full h-full" />
    </div>
  );
};

export default VideoPlayer;
