/**
 * useLoanGroups - Group selection hook
 * Manages group fetching and selection for group loans
 */

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface Group {
    id: string;
    name: string;
    members: any[];
    // ... other group fields
}

export function useLoanGroups(userId: string, enabled: boolean = false) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch groups
    useEffect(() => {
        if (!enabled || !userId) return;

        const fetchGroups = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                setGroups(data || []);
            } catch (error) {
                console.error('Error fetching groups:', error);
                toast.error('Failed to load groups');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, [userId, enabled]);

    // Get selected group
    const selectedGroup = groups.find(g => g.id === selectedGroupId) || null;

    // Reset selection
    const clearSelection = () => setSelectedGroupId(null);

    return {
        groups,
        selectedGroupId,
        setSelectedGroupId,
        selectedGroup,
        isLoading,
        clearSelection,
    };
}
