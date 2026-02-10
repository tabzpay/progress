import posthog from 'posthog-js';

// Initialize PostHog
export const initAnalytics = () => {
    // Only initialize in production or if explicitly enabled
    const apiKey = import.meta.env.VITE_POSTHOG_KEY;
    const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    if (apiKey) {
        posthog.init(apiKey, {
            api_host: host,
            autocapture: false, // We'll manually track events for more control
            capture_pageview: true,
            capture_pageleave: true,
        });
    }
};

// Identify user (call after login)
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
    if (!import.meta.env.VITE_POSTHOG_KEY) return;

    posthog.identify(userId, traits);
};

// Reset identity (call on logout)
export const resetAnalytics = () => {
    if (!import.meta.env.VITE_POSTHOG_KEY) return;

    posthog.reset();
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (!import.meta.env.VITE_POSTHOG_KEY) return;

    posthog.capture(eventName, properties);
};

// Common event tracking functions
export const analytics = {
    // User events
    userSignedUp: (userId: string, method: 'email' | 'google') => {
        trackEvent('user_signed_up', { method });
    },

    userLoggedIn: (userId: string) => {
        trackEvent('user_logged_in');
    },

    // Loan events
    loanCreated: (loanId: string, data: {
        type: string;
        amount: number;
        currency: string;
        hasGroup: boolean;
    }) => {
        trackEvent('loan_created', {
            loan_id: loanId,
            loan_type: data.type,
            amount: data.amount,
            currency: data.currency,
            has_group: data.hasGroup,
        });
    },

    loanViewed: (loanId: string) => {
        trackEvent('loan_viewed', { loan_id: loanId });
    },

    loanStatusChanged: (loanId: string, oldStatus: string, newStatus: string) => {
        trackEvent('loan_status_changed', {
            loan_id: loanId,
            old_status: oldStatus,
            new_status: newStatus,
        });
    },

    // Payment events
    paymentAdded: (loanId: string, amount: number) => {
        trackEvent('payment_added', {
            loan_id: loanId,
            amount,
        });
    },

    // Reminder events
    reminderSent: (loanId: string, channel: string) => {
        trackEvent('reminder_sent', {
            loan_id: loanId,
            channel,
        });
    },

    // Group events
    groupCreated: (groupId: string, memberCount: number) => {
        trackEvent('group_created', {
            group_id: groupId,
            member_count: memberCount,
        });
    },

    groupMemberAdded: (groupId: string) => {
        trackEvent('group_member_added', {
            group_id: groupId,
        });
    },

    // Feature usage
    featureUsed: (featureName: string, context?: Record<string, any>) => {
        trackEvent('feature_used', {
            feature_name: featureName,
            ...context,
        });
    },

    // Export events
    dataExported: (exportType: 'loans' | 'groups' | 'repayments', format: 'csv' | 'pdf') => {
        trackEvent('data_exported', {
            export_type: exportType,
            format,
        });
    },

    // Template events
    templateSaved: (templateName: string) => {
        trackEvent('template_saved', { template_name: templateName });
    },

    templateUsed: (templateName: string) => {
        trackEvent('template_used', { template_name: templateName });
    },
};
