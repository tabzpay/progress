/**
 * Converts an array of objects to a CSV string.
 * @param data Array of objects to convert
 * @param headers Optional array of header names and their object keys
 */
export function convertToCSV(
    data: any[],
    headers: { label: string; key: string }[]
): string {
    const csvRows = [];

    // Add the header row
    csvRows.push(headers.map((h) => h.label).join(","));

    // Add the data rows
    for (const row of data) {
        const values = headers.map((header) => {
            const val = row[header.key];
            const escaped = ("" + (val || "")).replace(/"/g, '""'); // Escape double quotes
            return `"${escaped}"`; // Wrap in double quotes
        });
        csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
}

/**
 * Triggers a browser download of a CSV file.
 * @param csv Content of the CSV file
 * @param filename Desired filename (e.g., 'export.csv')
 */
export function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Convenience function to convert and download data as CSV.
 */
export function exportToCSV(
    data: any[],
    headers: { label: string; key: string }[],
    filename: string
) {
    const csv = convertToCSV(data, headers);
    downloadCSV(csv, filename);
}
