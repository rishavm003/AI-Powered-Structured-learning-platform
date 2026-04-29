import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import LZString from 'lz-string';
import type { RoadmapConfig, Day } from '../types';
import { getUserId } from '../utils/userId';
import { ENV } from '../utils/envCheck';

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
      
      syncToCloud: async () => {
        const { config, roadmap } = get();
        if (!config || roadmap.length === 0) return;
        
        try {
          await fetch(`${ENV.PROXY_URL}/api/save-roadmap`, {
            method: 'POST',
            body: JSON.stringify({
              id: config.createdAt.toString(),
              user_id: getUserId(),
              config,
              roadmap
            })
          });
        } catch (e) {
          console.error("Failed to sync roadmap to D1", e);
        }
      },

      loadFromCloud: async () => {
        try {
          const res = await fetch(`${ENV.PROXY_URL}/api/load-roadmap?user_id=${getUserId()}`);
          const data = await res.json();
          if (data && data.roadmap) {
            set({ 
              config: JSON.parse(data.config), 
              roadmap: JSON.parse(data.roadmap) 
            });
          }
        } catch (e) {
          console.error("Failed to load roadmap from D1", e);
        }
      }
    }),
    {
      name: 'learnforge:roadmap',
      partialize: (state) => ({ config: state.config, roadmap: state.roadmap }),
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
