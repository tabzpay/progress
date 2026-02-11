/**
 * Email Notification Utility (SendGrid)
 */

interface SendEmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
    const isProd = process.env.NODE_ENV === 'production';
    const apiKey = process.env.VITE_SENDGRID_API_KEY;

    if (!isProd || !apiKey) {
        console.log("Mock Email Sent:", {
            ...options,
            timestamp: new Date().toISOString(),
            status: "delivered (mock)"
        });
        return { success: true, message: "Mock email delivered" };
    }

    try {
        // In a real implementation, we would use @sendgrid/mail
        // For this frontend/Supabase context, we likely call an Edge Function
        // or a backend API that wraps SendGrid.

        // Example Edge Function call:
        /*
        const { data, error } = await supabase.functions.invoke('send-email', {
            body: options
        });
        if (error) throw error;
        return { success: true, data };
        */

        console.log("Production Email Attempt (Requires Edge Function):", options);
        return { success: false, error: "Edge function not yet implemented" };
    } catch (error) {
        console.error("Email delivery failed:", error);
        return { success: false, error };
    }
};
