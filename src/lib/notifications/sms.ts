/**
 * SMS Notification Utility (Twilio)
 */

interface SendSMSOptions {
    to: string;
    message: string;
}

export const sendSMS = async (options: SendSMSOptions) => {
    const isProd = process.env.NODE_ENV === 'production';
    const accountSid = process.env.VITE_TWILIO_ACCOUNT_SID;
    const authToken = process.env.VITE_TWILIO_AUTH_TOKEN;

    if (!isProd || !accountSid || !authToken) {
        console.log("Mock SMS Sent:", {
            ...options,
            timestamp: new Date().toISOString(),
            status: "delivered (mock)"
        });
        return { success: true, message: "Mock SMS delivered" };
    }

    try {
        // In a real implementation, we would use twilio Node helper
        // or a backend Edge Function to protect credentials.

        console.log("Production SMS Attempt (Requires Edge Function):", options);
        return { success: false, error: "Edge function not yet implemented" };
    } catch (error) {
        console.error("SMS delivery failed:", error);
        return { success: false, error };
    }
};
