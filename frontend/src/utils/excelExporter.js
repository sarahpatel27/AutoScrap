import * as XLSX from 'xlsx';

/**
 * Formats an enquiry object into clean Excel row fields
 */
export function formatEnquiryForExport(row) {
  return {
    'Reference #': row.reference || '',
    'Date Submitted': row.date ? new Date(row.date).toLocaleString('en-GB') : (row.createdAt ? new Date(row.createdAt).toLocaleString('en-GB') : ''),
    'Status': row.status || 'Pending',
    'Registration': row.registration || row.vehicle?.registration || '',
    'Make': row.vehicle?.make || row.make || '',
    'Model': row.vehicle?.model || row.model || '',
    'Year': row.vehicle?.year || row.year || '',
    'Mileage': row.mileage ? `${Number(row.mileage).toLocaleString('en-GB')} mi` : (row.vehicle?.mileage || 'N/A'),
    'Condition': row.condition || row.vehicle?.condition || 'N/A',
    // 'Engine Starts': row.vehicle?.starts !== undefined ? (row.vehicle.starts ? 'Yes' : 'No') : 'N/A',
    // 'Alloy Wheels': row.vehicle?.alloys !== undefined ? (row.vehicle.alloys ? 'Yes' : 'No') : 'N/A',
    // 'Catalytic Converter': row.vehicle?.catalytic !== undefined ? (row.vehicle.catalytic ? 'Yes' : 'No') : 'N/A',
    'Postcode': row.postcode || '',
    'City / Area': row.city || row.area || '',
    'Customer Name': row.customer?.fullName || row.customerName || '',
    'Customer Email': row.customer?.email || row.customerEmail || '',
    'Customer Phone': row.customer?.phone || row.customerPhone || '',
    'Collection Address': row.customer?.collectionAddress || row.address || '',
    'Flat / House / Additional Info': row.customer?.additionalAddressDetails || '',
    'Quoted Price (£)': row.quote?.finalValue !== undefined
      ? `£${row.quote.finalValue}`
      : (row.highestBid ? `£${row.highestBid}` : (row.estimatedValue ? `£${row.estimatedValue}` : 'N/A')),
    'Bank Account Name': row.bank?.accountName || '',
    'Bank Account Number': row.bank?.accountNumber || '',
    'Bank Sort Code': row.bank?.sortCode || '',
    'Bank Name': row.bank?.bankName || '',
    'Customer Notes / Remarks': row.customer?.notes || row.notes || '',
  };
}

/**
 * Generates and downloads an Excel file (.xlsx) from an array of enquiry records
 */
export function exportEnquiriesToExcel(records = [], filenamePrefix = 'Vehicle_Enquiries') {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('No enquiry records available to export.');
  }

  const exportData = records.map(formatEnquiryForExport);
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Auto-fit column widths
  const maxColWidths = {};
  exportData.forEach((row) => {
    Object.keys(row).forEach((key) => {
      const valStr = String(row[key] || '');
      const currentMax = maxColWidths[key] || key.length;
      maxColWidths[key] = Math.max(currentMax, valStr.length);
    });
  });

  worksheet['!cols'] = Object.keys(maxColWidths).map((key) => ({
    wch: Math.min(Math.max(maxColWidths[key] + 3, 12), 40),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `${filenamePrefix}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
