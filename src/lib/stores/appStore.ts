/**
 * App Store - Global UI State
 * Manages theme, sidebar, notifications, and other UI state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    // Theme
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;

    // Sidebar (desktop)
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    // Command palette
    commandPaletteOpen: boolean;
    openCommandPalette: () => void;
    closeCommandPalette: () => void;

    // Help modal
    helpModalOpen: boolean;
    openHelpModal: () => void;
    closeHelpModal: () => void;

    // Notifications badge
    unreadNotifications: number;
    setUnreadNotifications: (count: number) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Theme
            theme: 'light',
            setTheme: (theme) => set({ theme }),

            // Sidebar
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            // Command palette
            commandPaletteOpen: false,
            openCommandPalette: () => set({ commandPaletteOpen: true }),
            closeCommandPalette: () => set({ commandPaletteOpen: false }),

            // Help modal
            helpModalOpen: false,
            openHelpModal: () => set({ helpModalOpen: true }),
            closeHelpModal: () => set({ helpModalOpen: false }),

            // Notifications
            unreadNotifications: 0,
            setUnreadNotifications: (count) => set({ unreadNotifications: count }),
        }),
        {
            name: 'progress-app-storage', // LocalStorage key
            partialize: (state) => ({
                // Only persist these values
                theme: state.theme,
                sidebarOpen: state.sidebarOpen,
            }),
        }
    )
);
