import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutGrid, 
  List, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Heart,
  Music,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Locale, Song } from './types';
import { generateSong, getReview } from './utils/musicGenerator';
import { MusicCover } from './components/MusicCover';
import { AudioPreview } from './components/AudioPreview';

const ITEMS_PER_PAGE = 10;
const GALLERY_BATCH_SIZE = 20;

export default function App() {
  const [view, setView] = useState<'table' | 'gallery'>('table');
  const [locale, setLocale] = useState<Locale>('en-US');
  const [seed, setSeed] = useState<number>(58933423);
  const [likesAvg, setLikesAvg] = useState<number>(3.7);
  const [page, setPage] = useState<number>(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [gallerySongs, setGallerySongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // Generate songs for table view
  const tableSongs = Array.from({ length: ITEMS_PER_PAGE }, (_, i) => {
    const globalIndex = (page - 1) * ITEMS_PER_PAGE + i + 1;
    return generateSong(globalIndex, seed, locale, likesAvg);
  });

  // Handle infinite scroll for gallery
  const loadMoreGallery = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    
    // Simulate slight delay for "loading" feel
    setTimeout(() => {
      setGallerySongs(prev => {
        const start = prev.length;
        const nextBatch = Array.from({ length: GALLERY_BATCH_SIZE }, (_, i) => {
          return generateSong(start + i + 1, seed, locale, likesAvg);
        });
        return [...prev, ...nextBatch];
      });
      setIsLoading(false);
    }, 300);
  }, [seed, locale, likesAvg, isLoading]);

  useEffect(() => {
    if (view === 'gallery') {
      setGallerySongs([]);
      loadMoreGallery();
    }
  }, [view, seed, locale, likesAvg]);

  useEffect(() => {
    if (view !== 'gallery') return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreGallery();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [view, loadMoreGallery]);

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 900000000) + 10000000);
    setPage(1);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Toolbar */}
      <header className="toolbar-gradient sticky top-0 z-50 border-b border-slate-800 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 mr-auto">
            <Music className="text-cyan-400" size={28} />
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">VibeStore</h1>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Language */}
            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700">
              <Globe size={16} className="ml-2 text-slate-400" />
              <select 
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="bg-transparent text-sm font-medium pr-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="en-US">English (US)</option>
                <option value="de-DE">Deutsch (DE)</option>
              </select>
            </div>

            {/* Seed */}
            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700">
              <input 
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                className="bg-transparent text-sm font-mono w-24 px-2 py-1 focus:outline-none"
              />
              <button 
                onClick={handleRandomSeed}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-cyan-400 transition-colors"
                title="Random Seed"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {/* Likes Slider */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-900/50 px-4 py-1.5 rounded-xl border border-slate-700">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Likes</span>
              <input 
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={likesAvg}
                onChange={(e) => setLikesAvg(parseFloat(e.target.value))}
                className="w-24 accent-cyan-400"
              />
              <span className="text-sm font-mono text-cyan-400 w-8">{likesAvg.toFixed(1)}</span>
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
              <button 
                onClick={() => setView('table')}
                className={`p-1.5 rounded-lg transition-all ${view === 'table' ? 'bg-cyan-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <List size={20} />
              </button>
              <button 
                onClick={() => setView('gallery')}
                className={`p-1.5 rounded-lg transition-all ${view === 'gallery' ? 'bg-cyan-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {view === 'table' ? (
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Song</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Artist</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Album</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Genre</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Likes</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tableSongs.map((song) => (
                  <React.Fragment key={song.index}>
                    <tr 
                      onClick={() => setExpandedId(expandedId === song.index ? null : song.index)}
                      className={`group cursor-pointer transition-colors ${expandedId === song.index ? 'bg-slate-800/40' : 'hover:bg-slate-800/20'}`}
                    >
                      <td className="px-6 py-4 font-mono text-sm text-slate-500">{song.index}</td>
                      <td className="px-6 py-4 font-medium text-slate-200">{song.title}</td>
                      <td className="px-6 py-4 text-slate-400">{song.artist}</td>
                      <td className="px-6 py-4 text-slate-500 hidden md:table-cell">{song.album}</td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {song.genre}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-cyan-400 font-medium">
                          <Heart size={14} fill={song.likes > 5 ? "currentColor" : "none"} />
                          {song.likes}
                        </div>
                      </td>
                      <td className="px-4 text-slate-600">
                        {expandedId === song.index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedId === song.index && (
                        <motion.tr 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-800/60"
                        >
                          <td colSpan={7} className="px-8 py-8">
                            <div className="flex flex-col md:flex-row gap-8">
                              <div className="shrink-0">
                                <MusicCover 
                                  title={song.title} 
                                  artist={song.artist} 
                                  album={song.album} 
                                  seed={song.coverSeed} 
                                  size={240}
                                />
                              </div>
                              <div className="flex-1 space-y-6">
                                <div>
                                  <h2 className="text-3xl font-bold text-white">{song.title}</h2>
                                  <p className="text-lg text-slate-400">{song.artist} • {song.album}</p>
                                </div>
                                
                                <AudioPreview index={song.index} seed={seed} />

                                <div className="space-y-2">
                                  <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-cyan-400">Review</h4>
                                  <p className="text-slate-300 italic leading-relaxed">
                                    "{getReview(song.index, locale)}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-t border-slate-800">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Page</span>
                <span className="text-lg font-bold text-cyan-400">{page}</span>
              </div>
              <button 
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {gallerySongs.map((song) => (
                <motion.div 
                  key={song.index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/40 border border-slate-800 rounded-3xl p-4 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="aspect-square mb-4 overflow-hidden rounded-2xl">
                    <MusicCover 
                      title={song.title} 
                      artist={song.artist} 
                      album={song.album} 
                      seed={song.coverSeed} 
                      size={320}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-100 truncate flex-1">{song.title}</h3>
                      <span className="text-[10px] font-mono text-slate-600 ml-2">#{song.index}</span>
                    </div>
                    <p className="text-sm text-slate-400 truncate">{song.artist}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{song.genre}</span>
                    <div className="flex items-center gap-1 text-cyan-400 text-sm font-medium">
                      <Heart size={12} fill={song.likes > 5 ? "currentColor" : "none"} />
                      {song.likes}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Loading Indicator for Infinite Scroll */}
            <div ref={observerTarget} className="py-12 flex justify-center">
              {isLoading && (
                <div className="flex items-center gap-3 text-slate-400">
                  <RefreshCw className="animate-spin text-cyan-400" size={20} />
                  <span className="text-sm font-medium">Loading next batch...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Status */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 py-2 px-4 text-center">
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live Deterministic Engine
          </div>
          <span className="opacity-30">|</span>
          <span>Seed: {seed}</span>
          <span className="opacity-30">|</span>
          <span>No AI Calls Active</span>
        </div>
      </footer>
    </div>
  );
}
