/**
 * Verification Utility
 * 
 * Handles verification status checks and updates for user profiles.
 * Users are considered "verified" when BOTH email and phone are verified.
 */

import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface VerificationStatus {
    isVerified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    emailVerifiedAt: string | null;
}

export interface ProfileVerificationData {
    is_verified: boolean;
    email_verified_at: string | null;
    phone_verified: boolean;
}

/**
 * Check if a user is verified based on their profile data
 * @param profile - Profile data from database
 * @returns Verification status object
 */
export function checkVerificationStatus(profile: ProfileVerificationData | null): VerificationStatus {
    if (!profile) {
        return {
            isVerified: false,
            emailVerified: false,
            phoneVerified: false,
            emailVerifiedAt: null,
        };
    }

    const emailVerified = profile.email_verified_at !== null;
    const phoneVerified = profile.phone_verified === true;

    return {
        isVerified: emailVerified && phoneVerified,
        emailVerified,
        phoneVerified,
        emailVerifiedAt: profile.email_verified_at,
    };
}

/**
 * Sync email verification status from auth.users to profiles table
 * This should be called after user login or when checking verification status
 * @param userId - User ID to sync
 */
export async function syncEmailVerification(userId: string): Promise<void> {
    try {
        // Get email_confirmed_at from auth.users via user object
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user || user.id !== userId) {
            console.error('Error getting user for email verification sync:', userError);
            return;
        }

        // Update profile with email verification timestamp
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                email_verified_at: user.email_confirmed_at
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Error syncing email verification:', updateError);
        }
    } catch (error) {
        console.error('Error in syncEmailVerification:', error);
    }
}

/**
 * Update phone verification status for a user
 * @param userId - User ID
 * @param verified - Whether phone is verified
 */
export async function updatePhoneVerification(userId: string, verified: boolean): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ phone_verified: verified })
            .eq('id', userId);

        if (error) {
            console.error('Error updating phone verification:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in updatePhoneVerification:', error);
        return false;
    }
}

/**
 * Get verification requirements that are missing for a user
 * @param status - Current verification status
 * @returns Array of missing requirements
 */
export function getMissingVerificationRequirements(status: VerificationStatus): string[] {
    const missing: string[] = [];

    if (!status.emailVerified) {
        missing.push('Email verification');
    }

    if (!status.phoneVerified) {
        missing.push('Phone verification');
    }

    return missing;
}

/**
 * Calculate verification progress percentage
 * @param status - Current verification status
 * @returns Progress from 0 to 100
 */
export function getVerificationProgress(status: VerificationStatus): number {
    let completed = 0;
    const total = 2; // email + phone

    if (status.emailVerified) completed++;
    if (status.phoneVerified) completed++;

    return Math.round((completed / total) * 100);
}
