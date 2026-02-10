import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    action: () => void;
    description: string;
}

export const useKeyboardShortcuts = (customShortcuts: ShortcutConfig[] = []) => {
    const navigate = useNavigate();

    const defaultShortcuts: ShortcutConfig[] = [
        {
            key: 'k',
            metaKey: true,
            action: () => openCommandPalette(),
            description: 'Open command palette',
        },
        {
            key: 'n',
            metaKey: true,
            action: () => navigate('/create-loan'),
            description: 'Create new loan',
        },
        {
            key: 'd',
            metaKey: true,
            action: () => navigate('/dashboard'),
            description: 'Go to dashboard',
        },
        {
            key: 'g',
            metaKey: true,
            action: () => navigate('/groups'),
            description: 'Go to groups',
        },
        {
            key: '?',
            shiftKey: true,
            action: () => openHelpModal(),
            description: 'Show keyboard shortcuts',
        },
    ];

    const openCommandPalette = useCallback(() => {
        // Dispatch custom event to open command palette
        window.dispatchEvent(new CustomEvent('openCommandPalette'));
    }, []);

    const openHelpModal = useCallback(() => {
        // Dispatch custom event to open help modal
        window.dispatchEvent(new CustomEvent('openHelpModal'));
    }, []);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const shortcuts = [...defaultShortcuts, ...customShortcuts];

            for (const shortcut of shortcuts) {
                const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const matchesCtrl = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
                const matchesMeta = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;
                const matchesShift = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;

                if (matchesKey && matchesCtrl && matchesMeta && matchesShift) {
                    // Don't trigger if user is typing in an input
                    const target = event.target as HTMLElement;
                    if (
                        target.tagName === 'INPUT' ||
                        target.tagName === 'TEXTAREA' ||
                        target.isContentEditable
                    ) {
                        // Only allow Escape key in inputs
                        if (event.key !== 'Escape') {
                            return;
                        }
                    }

                    event.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        },
        [customShortcuts, defaultShortcuts]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        shortcuts: [...defaultShortcuts, ...customShortcuts],
    };
};
