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
      
      // Cart/Favorites State
      favoriteTemplates: [],
      
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
      
      addToFavorites: (templateId) => set((state) => ({
        favoriteTemplates: [...state.favoriteTemplates, templateId]
      })),
      removeFromFavorites: (templateId) => set((state) => ({
        favoriteTemplates: state.favoriteTemplates.filter(id => id !== templateId)
      })),
      toggleFavorite: (templateId) => set((state) => {
        const isFavorite = state.favoriteTemplates.includes(templateId);
        return {
          favoriteTemplates: isFavorite
            ? state.favoriteTemplates.filter(id => id !== templateId)
            : [...state.favoriteTemplates, templateId]
        };
      }),
      
      updateUserPreferences: (preferences) => set((state) => ({
        userPreferences: { ...state.userPreferences, ...preferences }
      })),
    }),
    {
      name: 'notion-arabs-store',
      partialize: (state) => ({
        theme: state.theme,
        favoriteTemplates: state.favoriteTemplates,
        userPreferences: state.userPreferences,
        searchFilters: state.searchFilters,
      }),
    }
  )
);
