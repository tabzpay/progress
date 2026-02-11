import jsPDF from 'jspdf';

interface Loan {
    id: string;
    borrower_name: string;
    amount: number;
    currency?: string;
    status: string;
    due_date: string;
    created_at: string;
    description?: string;
    type?: string;
}

interface Repayment {
    id: string;
    amount: number;
    date: string;
    note?: string;
}

/**
 * Generate a professional PDF report for a loan
 * @param loan - The loan object
 * @param repayments - Array of repayments for this loan
 */
export async function generateLoanReport(loan: Loan, repayments: Repayment[] = []): Promise<void> {
    const pdf = new jsPDF();

    const currency = loan.currency || '$';
    const totalPaid = repayments.reduce((sum, r) => sum + Number(r.amount), 0);
    const balance = Number(loan.amount) - totalPaid;

    // Page setup
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59); // slate-900
    pdf.text('Loan Report', margin, y);

    y += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, y);

    // Divider
    y += 10;
    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.line(margin, y, pageWidth - margin, y);

    // Loan Summary Section
    y += 15;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('Loan Summary', margin, y);

    y += 10;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const summaryData = [
        ['Loan ID', loan.id],
        ['Borrower', loan.borrower_name],
        ['Loan Type', (loan.type || 'personal').toUpperCase()],
        ['Principal Amount', `${currency}${Number(loan.amount).toLocaleString()}`],
        ['Amount Paid', `${currency}${totalPaid.toLocaleString()}`],
        ['Balance Due', `${currency}${balance.toLocaleString()}`],
        ['Status', loan.status.toUpperCase()],
        ['Issue Date', new Date(loan.created_at).toLocaleDateString()],
        ['Due Date', new Date(loan.due_date).toLocaleDateString()],
    ];

    summaryData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(71, 85, 105); // slate-600
        pdf.text(`${label}:`, margin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 41, 59);
        pdf.text(value, margin + 50, y);
        y += 7;
    });

    // Description if present
    if (loan.description) {
        y += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(71, 85, 105);
        pdf.text('Description:', margin, y);
        y += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 41, 59);

        // Wrap text
        const splitDescription = pdf.splitTextToSize(loan.description, pageWidth - (margin * 2));
        pdf.text(splitDescription, margin, y);
        y += splitDescription.length * 7;
    }

    // Payment History Section
    if (repayments.length > 0) {
        y += 15;

        // Check if we need a new page
        if (y > 250) {
            pdf.addPage();
            y = 20;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        pdf.text('Payment History', margin, y);

        y += 10;

        // Table headers
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(241, 245, 249); // slate-100
        pdf.rect(margin, y - 5, pageWidth - (margin * 2), 8, 'F');
        pdf.setTextColor(51, 65, 85); // slate-700

        pdf.text('Date', margin + 2, y);
        pdf.text('Amount', margin + 50, y);
        pdf.text('Note', margin + 90, y);

        y += 10;

        // Table rows
        pdf.setFont('helvetica', 'normal');
        repayments.forEach((repayment) => {
            // Check if we need a new page
            if (y > 270) {
                pdf.addPage();
                y = 20;
            }

            pdf.setTextColor(30, 41, 59);
            pdf.text(new Date(repayment.date).toLocaleDateString(), margin + 2, y);
            pdf.text(`${currency}${Number(repayment.amount).toLocaleString()}`, margin + 50, y);

            const note = repayment.note || '-';
            const wrappedNote = pdf.splitTextToSize(note, 80);
            pdf.text(wrappedNote[0], margin + 90, y);

            y += 8;

            // Divider line
            pdf.setDrawColor(226, 232, 240);
            pdf.line(margin, y - 2, pageWidth - margin, y - 2);
        });

        // Total row
        y += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Total Paid:', margin + 2, y);
        pdf.text(`${currency}${totalPaid.toLocaleString()}`, margin + 50, y);
    } else {
        y += 15;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text('No payment history available', margin, y);
    }

    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 20;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text('Generated by TabzPay - Loan Tracking Platform', margin, footerY);
    pdf.text(`Page 1`, pageWidth - margin - 15, footerY);

    // Save the PDF
    const fileName = `loan-report-${loan.borrower_name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
}

/**
 * Alternative: Generate PDF with more styling options
 * This is a placeholder for future enhancement with html2canvas
 */
export async function generateLoanReportAdvanced(
    loan: Loan,
    repayments: Repayment[] = [],
    htmlElement?: HTMLElement
): Promise<void> {
    // For future implementation with html2canvas
    // This would allow capturing a styled HTML version
    // and converting it to PDF

    // For now, fall back to standard generation
    return generateLoanReport(loan, repayments);
}
