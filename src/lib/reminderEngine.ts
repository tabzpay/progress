import { supabase } from "./supabase";
import { sendEmail } from "./notifications/email";
import { sendSMS } from "./notifications/sms";
import { notifyIfPossible } from "./notifications";

/**
 * Reminder Engine
 * In production, this would run as a scheduled Edge Function or Cron job.
 * For this implementation, we simulate the logic.
 */

export const processReminderSchedules = async () => {
    console.log("Starting reminder engine scan...");

    try {
        // 1. Fetch all active schedules for unpaid loans
        const { data: schedules, error: scheduleError } = await supabase
            .from('reminder_schedules')
            .select(`
                *,
                loans (*)
            `)
            .eq('is_enabled', true);

        if (scheduleError) throw scheduleError;
        if (!schedules || schedules.length === 0) {
            console.log("No active reminder schedules found.");
            return;
        }

        const results = [];

        for (const schedule of schedules) {
            const loan = schedule.loans;
            if (!loan || loan.status === 'PAID') continue;

            const dueDate = new Date(loan.due_date);
            const today = new Date();

            // Normalize dates to midnight for comparison
            today.setHours(0, 0, 0, 0);
            const targetDate = new Date(dueDate);
            targetDate.setDate(dueDate.getDate() + schedule.days_offset);
            targetDate.setHours(0, 0, 0, 0);

            // Check if it's time to run (today matches target date AND not run today)
            const lastRun = schedule.last_run_at ? new Date(schedule.last_run_at) : null;
            if (lastRun) lastRun.setHours(0, 0, 0, 0);

            if (today.getTime() === targetDate.getTime() && (!lastRun || lastRun.getTime() < today.getTime())) {
                console.log(`Processing reminder for loan: ${loan.id} via ${schedule.channel}`);

                // 2. Fetch template (or use default)
                // For now, we use a simple message generator
                const message = generateReminderMessage(loan, schedule.type);

                let success = false;

                // 3. Send via appropriate channel
                if (schedule.channel === 'email' && loan.borrower_email) {
                    const res = await sendEmail({
                        to: loan.borrower_email,
                        subject: `Reminder: Loan Payment for ${loan.borrower_name}`,
                        text: message
                    });
                    success = res.success;
                } else if (schedule.channel === 'sms') {
                    const res = await sendSMS({
                        to: loan.borrower_phone || "Unknown",
                        message: message
                    });
                    success = res.success;
                } else {
                    // Default to system notification for the lender
                    await notifyIfPossible(`Time to remind ${loan.borrower_name}`, {
                        body: `Schedule triggered: ${schedule.type}`
                    });
                    success = true;
                }

                if (success) {
                    // 4. Log the reminder
                    await supabase.from('reminders').insert([{
                        loan_id: loan.id,
                        message: message,
                        channel: schedule.channel,
                        status: 'delivered',
                        scheduled_at: new Date().toISOString()
                    }]);

                    // 5. Update last_run_at
                    await supabase.from('reminder_schedules')
                        .update({ last_run_at: new Date().toISOString() })
                        .eq('id', schedule.id);

                    results.push({ loanId: loan.id, type: schedule.type, status: 'sent' });
                }
            }
        }

        console.log(`Reminder engine scan complete. Processed ${results.length} reminders.`);
        return results;

    } catch (error) {
        console.error("Reminder engine failure:", error);
    }
};

const generateReminderMessage = (loan: any, type: string) => {
    const amount = `${loan.currency} ${Number(loan.amount).toLocaleString()}`;
    const date = new Date(loan.due_date).toLocaleDateString();

    switch (type) {
        case 'before_due':
            return `Hello ${loan.borrower_name}, this is a friendly reminder that your payment of ${amount} is due on ${date}.`;
        case 'on_due':
            return `Hello ${loan.borrower_name}, your payment of ${amount} is due today. Please let us know if you have any questions.`;
        case 'after_due':
            return `Hello ${loan.borrower_name}, your payment of ${amount} was due on ${date}. Please process it at your earliest convenience.`;
        default:
            return `Reminder for your loan of ${amount} due on ${date}.`;
    }
};
