import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

type SongDifficulty = 'easy' | 'medium' | 'hard';
type DistortionLevel = 'low' | 'high';

const DIFFICULTY_STORAGE_KEY = 'rhythmforge_song_difficulty';
const DISTORTION_STORAGE_KEY = 'rhythmforge_distortion_level';
const CIRCUIT_COLLECTION_ID = 'CIRCUIT_COLLECTION_ID';

type SongCard = {
  id: string;
  name: string;
  icon: string;
  audioUrl: string;
  cover?: string;
};

const DEFAULT_SONGS: SongCard[] = [
  { id: '1', name: 'Nebula Sprint', icon: '🎵', audioUrl: `${import.meta.env.BASE_URL}audio/song.mp3` },
  { id: '2', name: 'Phantom Pulse', icon: '🎧', audioUrl: `${import.meta.env.BASE_URL}audio/song.mp3` },
  { id: '3', name: 'Solflare Sync', icon: '🥁', audioUrl: `${import.meta.env.BASE_URL}audio/song.mp3` }
];

export default function SongMenuPage() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [difficulty, setDifficulty] = useState<SongDifficulty>('medium');
  const [distortionLevel, setDistortionLevel] = useState<DistortionLevel>('high');
  const [songs, setSongs] = useState<SongCard[]>(DEFAULT_SONGS);
  const [tracksMenuOpen, setTracksMenuOpen] = useState(false);
  const [tracksMenuScrolling, setTracksMenuScrolling] = useState(false);
  const scrollBlurTimeoutRef = useRef<number | null>(null);

  const handleImportTrack = () => {
    window.alert('Import Track coming soon — upload and mint flow will live here.');
  };

  const handleFullLibrary = () => {
    window.alert('Full Library coming soon — community and Circuit catalog will live here.');
  };

  useEffect(() => {
    const savedDifficulty = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
    if (savedDifficulty === 'easy' || savedDifficulty === 'medium' || savedDifficulty === 'hard') {
      setDifficulty(savedDifficulty);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DIFFICULTY_STORAGE_KEY, difficulty);
  }, [difficulty]);

  useEffect(() => {
    const savedDistortion = localStorage.getItem(DISTORTION_STORAGE_KEY);
    if (savedDistortion === 'low' || savedDistortion === 'high') {
      setDistortionLevel(savedDistortion);
      document.documentElement.setAttribute('data-distortion', savedDistortion);
      return;
    }

    document.documentElement.setAttribute('data-distortion', 'high');
  }, []);

  useEffect(() => {
    localStorage.setItem(DISTORTION_STORAGE_KEY, distortionLevel);
    document.documentElement.setAttribute('data-distortion', distortionLevel);
  }, [distortionLevel]);

  useEffect(() => {
    let isCancelled = false;

    const loadCircuitNfts = async () => {
      if (!publicKey) {
        setSongs(DEFAULT_SONGS);
        return;
      }

      try {
        const walletSeed = publicKey.toBase58().slice(0, 12);
        const validNftSongs: SongCard[] = Array.from({ length: 3 }, (_, index) => {
          const tokenId = `${walletSeed}-${index + 1}`;
          return {
            id: `circuit-${tokenId}`,
            name: `Circuit Track ${index + 1}`,
            icon: '🎛️',
            audioUrl: `${import.meta.env.BASE_URL}audio/song.mp3`,
            cover: `https://picsum.photos/seed/${encodeURIComponent(`${CIRCUIT_COLLECTION_ID}-${tokenId}`)}/420/280`,
          };
        });

        if (!isCancelled) {
          setSongs(validNftSongs.length > 0 ? [...validNftSongs, ...DEFAULT_SONGS] : DEFAULT_SONGS);
        }
      } catch (error) {
        console.error('Failed to fetch Circuit NFTs:', error);
        if (!isCancelled) {
          setSongs(DEFAULT_SONGS);
        }
      }
    };

    void loadCircuitNfts();

    return () => {
      isCancelled = true;
    };
  }, [publicKey]);

  useEffect(() => {
    return () => {
      if (scrollBlurTimeoutRef.current !== null) {
        window.clearTimeout(scrollBlurTimeoutRef.current);
      }
    };
  }, []);

  const handleTrackMenuScroll = () => {
    setTracksMenuScrolling(true);
    if (scrollBlurTimeoutRef.current !== null) {
      window.clearTimeout(scrollBlurTimeoutRef.current);
    }

    scrollBlurTimeoutRef.current = window.setTimeout(() => {
      setTracksMenuScrolling(false);
    }, 180);
  };

  return (
    <div className={`song-menu-page ${tracksMenuOpen ? 'is-tracks-open' : ''} ${tracksMenuScrolling ? 'is-tracks-scrolling' : ''}`}>
      <div className="song-menu-aura" />
      <div className="song-menu-stars" />
      <div className="song-menu-vignette" />
      <div className="song-menu-content">
        <h1 className="song-menu-title" aria-label="Your Circuit Tracks">
          <span>Your Circuit Tracks</span>
          <span aria-hidden="true">Your Circuit Tracks</span>
        </h1>

        <div className="song-menu-actions">
          {connected && (
            <button type="button" className="song-menu-action-button song-menu-action-button-wallet" onClick={() => setVisible(true)}>
              Change wallet
            </button>
          )}
          <button type="button" className="song-menu-action-button" onClick={handleImportTrack}>
            Import Track
          </button>
          <button type="button" className="song-menu-action-button" onClick={handleFullLibrary}>
            Full Library
          </button>
          <button
            type="button"
            className="song-menu-action-button song-menu-action-button-tracks"
            onClick={() => setTracksMenuOpen((previous) => !previous)}
            aria-expanded={tracksMenuOpen}
            aria-controls="song-track-drawer"
          >
            {tracksMenuOpen ? 'Hide Tracks' : `Browse Tracks (${songs.length})`}
          </button>
        </div>

        <div className="song-menu-difficulty" role="group" aria-label="Select difficulty">
          <span className="song-menu-difficulty-label">Difficulty</span>
          <div className="song-menu-difficulty-buttons">
            {(['easy', 'medium', 'hard'] as SongDifficulty[]).map((level) => (
              <button
                key={level}
                type="button"
                className={`song-menu-difficulty-button ${difficulty === level ? 'is-active' : ''}`}
                onClick={() => setDifficulty(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="song-menu-difficulty" role="group" aria-label="Select distortion level">
          <span className="song-menu-difficulty-label">Distortion</span>
          <div className="song-menu-difficulty-buttons">
            {(['low', 'high'] as DistortionLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                className={`song-menu-difficulty-button ${distortionLevel === level ? 'is-active' : ''}`}
                onClick={() => setDistortionLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <p className="song-menu-hint">Open Browse Tracks to pick a song from the collapsible list.</p>
      </div>
      {tracksMenuOpen && (
        <button
          type="button"
          className="song-menu-overlay-backdrop"
          aria-label="Close track drawer"
          onClick={() => setTracksMenuOpen(false)}
        />
      )}
      {tracksMenuOpen && (
        <div
          id="song-track-drawer"
          className={`song-menu-track-drawer ${tracksMenuScrolling ? 'is-scrolling' : ''}`}
          onScroll={handleTrackMenuScroll}
        >
          <div className="song-menu-track-drawer-header">
            <h2>Track Menu</h2>
            <button type="button" className="song-menu-action-button" onClick={() => setTracksMenuOpen(false)}>
              Close
            </button>
          </div>
          <div className="song-menu-grid">
            {songs.map(song => (
              <Link
                key={song.id}
                to="/play"
                state={{ songId: song.id, songName: song.name, songAudioUrl: song.audioUrl, difficulty }}
                className="song-menu-link"
                onClick={() => setTracksMenuOpen(false)}
              >
                <div className="song-menu-card">
                  {song.cover ? (
                    <img className="song-menu-cover" src={song.cover} alt={`${song.name} cover art`} loading="lazy" />
                  ) : (
                    <div className="song-menu-icon" aria-hidden="true">{song.icon}</div>
                  )}
                  <h3 className="song-menu-name">{song.name}</h3>
                  <p className="song-menu-hint">Tap to play</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}