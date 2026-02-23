/**
 * Email Notification Utility (SendGrid)
 */

interface SendEmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export interface PaymentReceiptOptions {
    to: string;
    borrowerName: string;
    lenderName: string;
    amount: number;
    currency: string;
    loanId: string;
    remainingBalance: number;
    paymentDate?: string;
    note?: string | undefined;
}

/**
 * Send a formatted payment receipt email to a borrower or lender.
 */
export const sendPaymentReceiptEmail = async (opts: PaymentReceiptOptions) => {
    const currencySymbols: Record<string, string> = {
        USD: '$', EUR: '€', GBP: '£', NGN: '₦', GHS: '₵', KES: 'KSh',
    };
    const symbol = currencySymbols[opts.currency] || '$';
    const dateStr = opts.paymentDate
        ? new Date(opts.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #4f46e5, #2563eb); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 800;">Payment Receipt</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">${dateStr}</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #475569; font-size: 15px; margin: 0 0 24px;">Hi <strong>${opts.borrowerName}</strong>, a payment has been recorded on your loan.</p>
        <div style="background: #f8faff; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #64748b; font-size: 13px;">Amount Paid</span>
            <strong style="color: #0f172a; font-size: 18px;">${symbol}${opts.amount.toLocaleString()}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #64748b; font-size: 13px;">Remaining Balance</span>
            <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${symbol}${opts.remainingBalance.toLocaleString()}</span>
          </div>
          ${opts.note ? `<div style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 4px;"><span style="color: #64748b; font-size: 13px;">Note: </span><span style="color: #334155; font-size: 13px;">${opts.note}</span></div>` : ''}
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Loan #${opts.loanId.slice(0, 8).toUpperCase()} · Issued by ${opts.lenderName}</p>
      </div>
    </div>`;

    return sendEmail({
        to: opts.to,
        subject: `Payment Receipt — ${symbol}${opts.amount.toLocaleString()} received`,
        text: `Hi ${opts.borrowerName}, a payment of ${symbol}${opts.amount.toLocaleString()} has been logged. Remaining balance: ${symbol}${opts.remainingBalance.toLocaleString()}.`,
        html,
    });
};

export const sendEmail = async (options: SendEmailOptions) => {
    const isProd = process.env['NODE_ENV'] === 'production';
    const apiKey = process.env['VITE_SENDGRID_API_KEY'];

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
