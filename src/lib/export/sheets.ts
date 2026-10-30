import * as XLSX from 'xlsx';
import { Lead } from '@/types';

export function exportLeadsToExcel(leads: Lead[], filename = 'LocalLead_AI_Export.xlsx') {
  const data = leads.map((lead) => ({
    'Business Name': lead.name,
    'Category': lead.category,
    'Subcategory': lead.subcategory || '',
    'City': lead.city,
    'Address': lead.address,
    'Phone': lead.phone || '',
    'Email': lead.email || '',
    'Website': lead.website || '',
    'Opportunity Score': lead.opportunityScore,
    'Opportunity Tier': lead.opportunityTier,
    'Est. Monthly Leak (USD)': lead.auditReport?.estimatedMonthlyLeakUSD || 0,
    'Est. Deal Value (USD)': lead.estimatedDealValue,
    'Pipeline Stage': lead.pipelineStage,
    'Follow-up Date': lead.followUpDate || '',
    'Follow-up Note': lead.followUpNote || '',
    'SSL Status': lead.auditReport ? (lead.auditReport.isHttps ? 'Valid HTTPS' : 'Insecure / Missing') : 'Unscanned',
    'Booking Widget': lead.auditReport ? (lead.auditReport.hasBooking ? (lead.auditReport.bookingProvider || 'Detected') : 'Missing') : 'Unscanned',
    'WhatsApp CTA': lead.auditReport ? (lead.auditReport.hasWhatsApp ? 'Detected' : 'Missing') : 'Unscanned',
    'Schema.org SEO': lead.auditReport ? (lead.auditReport.hasSchema ? 'Detected' : 'Missing') : 'Unscanned',
    'Audit Issues Count': lead.auditReport?.issues.length || 0,
    'Created At': lead.createdAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads & Opportunities');

  XLSX.writeFile(workbook, filename);
}

export function exportLeadsToCSV(leads: Lead[], filename = 'LocalLead_AI_Export.csv') {
  const data = leads.map((lead) => ({
    'Business Name': lead.name,
    'Category': lead.category,
    'City': lead.city,
    'Address': lead.address,
    'Phone': lead.phone || '',
    'Email': lead.email || '',
    'Website': lead.website || '',
    'Opportunity Score': lead.opportunityScore,
    'Opportunity Tier': lead.opportunityTier,
    'Est. Monthly Leak (USD)': lead.auditReport?.estimatedMonthlyLeakUSD || 0,
    'Pipeline Stage': lead.pipelineStage,
    'Follow-up Date': lead.followUpDate || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function parseImportedFile(file: File): Promise<Partial<Lead>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        const parsed: Partial<Lead>[] = rawJson.map((row, idx) => ({
          id: `lead_import_${idx}_${Date.now().toString(36)}`,
          name: row['Business Name'] || row['name'] || row['Company'] || `Imported Business #${idx + 1}`,
          category: row['Category'] || row['category'] || 'Local Business',
          city: row['City'] || row['city'] || 'Local City',
          address: row['Address'] || row['address'] || '',
          phone: row['Phone'] || row['phone'] || '',
          email: row['Email'] || row['email'] || '',
          website: row['Website'] || row['website'] || row['URL'] || '',
          lat: parseFloat(row['lat'] || row['Latitude'] || '30.2672'),
          lon: parseFloat(row['lon'] || row['Longitude'] || '-97.7431'),
          opportunityScore: 50,
          opportunityTier: 'WARM',
          pipelineStage: 'DISCOVERED',
          estimatedDealValue: 1800,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
