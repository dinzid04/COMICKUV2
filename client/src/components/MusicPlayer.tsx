import React, { useState, useRef, useEffect } from 'react';

interface SongData {
  audio: {
    url: string;
  };
  metadata: {
    title: string;
    artist: string;
    thumbnail: string;
  };
}

const MusicPlayer: React.FC = () => {
  const [playlist, setPlaylist] = useState<SongData[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const savedPlaylist = localStorage.getItem('playlist');
    if (savedPlaylist) {
      setPlaylist(JSON.parse(savedPlaylist));
    }
  }, []);

  const currentSong = playlist[currentSongIndex];

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await fetch('https://swagger-nextjs-one.vercel.app/api/downloader/ytaudio?query=505&direct=false');
        const data = await response.json();
        if (data.status) {
            setPlaylist([data.data]);
        }
      } catch (error) {
        console.error('Error fetching song:', error);
      }
    };
    if(playlist.length === 0){
        fetchSong();
    }
  }, [playlist]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

    const playNextSong = () => {
        setCurrentSongIndex((prevIndex) => (prevIndex + 1) % playlist.length);
        setIsPlaying(true);
    };

    const playPrevSong = () => {
        setCurrentSongIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
        setIsPlaying(true);
    };

  const handleSongEnd = () => {
    if(isLooping && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
    } else {
        playNextSong();
    }
  }

  const addToPlaylist = () => {
    if (currentSong) {
      const newPlaylist = [...playlist, currentSong];
      setPlaylist(newPlaylist);
      localStorage.setItem('playlist', JSON.stringify(newPlaylist));
    }
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="music-player">
      <img src={currentSong.metadata.thumbnail} alt={currentSong.metadata.title} className="music-player__thumbnail" />
      <div className="music-player__details">
        <div className="music-player__title">{currentSong.metadata.title}</div>
        <div className="music-player__artist">{currentSong.metadata.artist}</div>
      </div>
      <div className="music-player__controls">
        <div className="music-player__buttons">
          <button className="music-player__button" onClick={playPrevSong}>⏮</button>
          <button className="music-player__button" onClick={togglePlayPause}>
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button className="music-player__button" onClick={playNextSong}>⏭</button>
        </div>
        <div className="music-player__progress-container">
          <div className="music-player__progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <div className="music-player__actions">
        <button className="music-player__button" onClick={addToPlaylist}>+</button>
        <button className="music-player__button" onClick={() => setIsLooping(!isLooping)}>
            {isLooping ? '🔁' : '➡️'}
        </button>
      </div>
      <audio
        ref={audioRef}
        src={currentSong.audio.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
        autoPlay={isPlaying}
      />
    </div>
  );
};

export default MusicPlayer;
