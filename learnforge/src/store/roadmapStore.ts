import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import LZString from 'lz-string';
import type { RoadmapConfig, Day } from '../types';

interface RoadmapState {
  config: RoadmapConfig | null;
  roadmap: Day[];
  isLoading: boolean;
  error: string | null;
  setConfig: (config: RoadmapConfig) => void;
  setRoadmap: (roadmap: Day[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearRoadmap: () => void;
}

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set) => ({
      config: null,
      roadmap: [],
      isLoading: false,
      error: null,
      setConfig: (config) => set({ config }),
      setRoadmap: (roadmap) => set({ roadmap, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearRoadmap: () => set({ config: null, roadmap: [], error: null }),
    }),
    {
      name: 'learnforge:roadmap',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            return LZString.decompressFromUTF16(str);
          } catch (e) {
            return null;
          }
        },
        setItem: (name, value) => {
          const compressed = LZString.compressToUTF16(value);
          localStorage.setItem(name, compressed);
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
    }
  )
);
