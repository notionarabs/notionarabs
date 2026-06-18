import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // UI State
      sidebarOpen: false,
      theme: 'light',
      
      // Search State
      searchQuery: '',
      searchFilters: {
        category: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      
      // User Preferences
      userPreferences: {
        language: 'ar',
        notifications: true,
        darkMode: false,
      },
      
      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchFilters: (filters) => set((state) => ({
        searchFilters: { ...state.searchFilters, ...filters }
      })),
      clearSearchFilters: () => set({
        searchQuery: '',
        searchFilters: {
          category: '',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }
      }),
      
      updateUserPreferences: (preferences) => set((state) => ({
        userPreferences: { ...state.userPreferences, ...preferences }
      })),
    }),
    {
      name: 'notion-arabs-store',
      partialize: (state) => ({
        theme: state.theme,
        userPreferences: state.userPreferences,
        searchFilters: state.searchFilters,
      }),
    }
  )
);
