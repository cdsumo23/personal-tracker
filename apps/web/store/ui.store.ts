import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  isSidebarOpen: boolean;
  theme: 'dark' | 'light';
  currency: string;
  notificationCount: number;
  isSearchOpen: boolean;
  activeModal: string | null;
  isPageLoading: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setCurrency: (currency: string) => void;
  setNotificationCount: (count: number) => void;
  decrementNotifications: () => void;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  openModal: (name: string) => void;
  closeModal: () => void;
  setPageLoading: (loading: boolean) => void;
}

type UIStore = UIState & UIActions;

export const useUiStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // State
      isSidebarOpen: true,
      theme: 'dark',
      currency: 'USD',
      notificationCount: 0,
      isSearchOpen: false,
      activeModal: null,
      isPageLoading: false,

      // Actions
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
          document.documentElement.classList.toggle('light', theme === 'light');
        }
      },

      setCurrency: (currency) => set({ currency }),

      setNotificationCount: (count) =>
        set({ notificationCount: Math.max(0, count) }),

      decrementNotifications: () =>
        set((state) => ({
          notificationCount: Math.max(0, state.notificationCount - 1),
        })),

      setSearchOpen: (open) => set({ isSearchOpen: open }),

      toggleSearch: () =>
        set((state) => ({ isSearchOpen: !state.isSearchOpen })),

      openModal: (name) => set({ activeModal: name }),

      closeModal: () => set({ activeModal: null }),

      setPageLoading: (loading) => set({ isPageLoading: loading }),
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        theme: state.theme,
        currency: state.currency,
      }),
    }
  )
);
