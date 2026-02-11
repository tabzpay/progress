import { supabase } from "./supabase";

export type ActivityType =
    | 'LOGIN'
    | 'LOAN_CREATED'
    | 'PAYMENT_RECORDED'
    | 'MFA_ENABLED'
    | 'MFA_DISABLED'
    | 'PRIVACY_SHIELD_UNLOCKED'
    | 'PRIVACY_SHIELD_LOCKED';

/**
 * Utility to log user activities for the audit trail.
 */
export async function logActivity(
    type: ActivityType,
    description: string,
    metadata: Record<string, any> = {}
) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('activity_log').insert([{
            user_id: user.id,
            activity_type: type,
            description,
            metadata,
            user_agent: window.navigator.userAgent
        }]);

        if (error) {
            console.error("Error logging activity:", error);
        }
    } catch (err) {
        console.error("Critical error in logActivity:", err);
    }
}
