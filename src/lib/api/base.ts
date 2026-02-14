/**
 * API Base Module
 * Wrapper around Supabase client for centralized API calls
 * Makes it easier to mock for testing and swap databases if needed
 */

import { supabase } from '../supabase';
import { handleError } from '../utils/errorHandler';

/**
 * Base API response wrapper
 */
export interface ApiResponse<T> {
    data: T | null;
    error: Error | null;
}

/**
 * Execute a Supabase query with error handling
 */
export async function executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
    const { data, error } = await queryFn();

    if (error) {
        const appError = handleError(error);
        throw new Error(appError.message);
    }

    if (!data) {
        throw new Error('No data returned from query');
    }

    return data;
}

/**
 * Base CRUD operations helper
 */
export function createBaseApi<T>(tableName: string) {
    return {
        /**
         * Get all records with optional filtering
         */
        async getAll(userId: string, filters?: Record<string, any>): Promise<T[]> {
            let query = supabase
                .from(tableName)
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        query = query.eq(key, value);
                    }
                });
            }

            return executeQuery(() => query);
        },

        /**
         * Get single record by ID
         */
        async getById(id: string): Promise<T> {
            return executeQuery(() =>
                supabase
                    .from(tableName)
                    .select('*')
                    .eq('id', id)
                    .single()
            );
        },

        /**
         * Create new record
         */
        async create(data: Partial<T>): Promise<T> {
            return executeQuery(() =>
                supabase
                    .from(tableName)
                    .insert([data])
                    .select()
                    .single()
            );
        },

        /**
         * Update existing record
         */
        async update(id: string, data: Partial<T>): Promise<T> {
            return executeQuery(() =>
                supabase
                    .from(tableName)
                    .update(data)
                    .eq('id', id)
                    .select()
                    .single()
            );
        },

        /**
         * Delete record
         */
        async delete(id: string): Promise<void> {
            await executeQuery(() =>
                supabase
                    .from(tableName)
                    .delete()
                    .eq('id', id)
            );
        },
    };
}

export { supabase };
