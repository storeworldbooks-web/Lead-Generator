import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Lead } from '@/types';
import { formatCurrency, formatDate } from '@/utils';

export async function generateProposalPDF(lead: Lead, agencyName = 'LeadGenerator Agency'): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size in points
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const audit = lead.auditReport;
  const isHot = lead.opportunityTier === 'HOT';
  const score = lead.opportunityScore;
  const leak = audit ? audit.estimatedMonthlyLeakUSD : lead.estimatedDealValue;

  // Colors
  const darkNavy = rgb(0.06, 0.09, 0.16); // #0F172A
  const primaryIndigo = rgb(0.31, 0.27, 0.90); // #4F46E5
  const alertRose = rgb(0.88, 0.11, 0.28); // #E11D48
  const warmAmber = rgb(0.85, 0.55, 0.05); // #D97706
  const successGreen = rgb(0.02, 0.59, 0.41); // #059669
  const textDark = rgb(0.12, 0.16, 0.23);
  const textMuted = rgb(0.40, 0.45, 0.53);
  const cardBg = rgb(0.96, 0.97, 0.98);
  const cardBorder = rgb(0.88, 0.91, 0.94);

  // Top Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 90,
    width: width,
    height: 90,
    color: darkNavy,
  });

  page.drawText('GROWTHMACHINE STUDIO', {
    x: 40,
    y: height - 42,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('EXECUTIVE LOCAL SEO & DIGITAL OPPORTUNITY REPORT', {
    x: 40,
    y: height - 62,
    size: 9,
    font: fontRegular,
    color: rgb(0.7, 0.75, 0.85),
  });

  page.drawText(`DATE: ${formatDate(new Date().toISOString())}`, {
    x: width - 180,
    y: height - 52,
    size: 9,
    font: fontRegular,
    color: rgb(0.8, 0.85, 0.95),
  });

  // Client Info Section
  let currentY = height - 125;

  page.drawText('TARGET BUSINESS PROFILE', {
    x: 40,
    y: currentY,
    size: 11,
    font: fontBold,
    color: primaryIndigo,
  });

  currentY -= 20;

  page.drawText(`Company: ${lead.name}`, {
    x: 40,
    y: currentY,
    size: 13,
    font: fontBold,
    color: textDark,
  });

  page.drawText(`Market: ${lead.category} in ${lead.city}`, {
    x: 320,
    y: currentY,
    size: 10,
    font: fontRegular,
    color: textMuted,
  });

  currentY -= 16;
  page.drawText(`Website: ${lead.website || 'No Registered Website (Direct Directory Lead)'}`, {
    x: 40,
    y: currentY,
    size: 9.5,
    font: fontRegular,
    color: lead.website ? textDark : alertRose,
  });

  page.drawText(`Phone: ${lead.phone || 'N/A'}`, {
    x: 320,
    y: currentY,
    size: 9.5,
    font: fontRegular,
    color: textDark,
  });

  // Score & Revenue Leak Box
  currentY -= 95;

  page.drawRectangle({
    x: 40,
    y: currentY,
    width: width - 80,
    height: 80,
    color: cardBg,
    borderColor: isHot ? alertRose : cardBorder,
    borderWidth: 1.5,
  });

  // Left column: Opportunity Score
  page.drawText('OPPORTUNITY SCORE', {
    x: 60,
    y: currentY + 54,
    size: 9,
    font: fontBold,
    color: textMuted,
  });

  page.drawText(`${score} / 100`, {
    x: 60,
    y: currentY + 22,
    size: 26,
    font: fontBold,
    color: isHot ? alertRose : warmAmber,
  });

  page.drawText(`TIER: ${lead.opportunityTier} PRIORITY`, {
    x: 60,
    y: currentY + 8,
    size: 8,
    font: fontBold,
    color: isHot ? alertRose : warmAmber,
  });

  // Center column: Est. Monthly Revenue Leak
  page.drawText('ESTIMATED MONTHLY REVENUE LEAK', {
    x: 220,
    y: currentY + 54,
    size: 9,
    font: fontBold,
    color: textMuted,
  });

  page.drawText(`${formatCurrency(leak)} / mo`, {
    x: 220,
    y: currentY + 22,
    size: 24,
    font: fontBold,
    color: textDark,
  });

  page.drawText('Based on bounced local mobile traffic & competitors capturing map queries', {
    x: 220,
    y: currentY + 8,
    size: 7.5,
    font: fontRegular,
    color: textMuted,
  });

  // Right column: Status
  page.drawText('HEALTH STATUS', {
    x: 440,
    y: currentY + 54,
    size: 9,
    font: fontBold,
    color: textMuted,
  });

  page.drawText(isHot ? 'CRITICAL LEAKS' : 'NEEDS OPTIMIZATION', {
    x: 440,
    y: currentY + 26,
    size: 11,
    font: fontBold,
    color: isHot ? alertRose : warmAmber,
  });

  // Technical Audit Breakdown
  currentY -= 35;
  page.drawText('TECHNICAL DIAGNOSTICS & AUDIT CHECKLIST', {
    x: 40,
    y: currentY,
    size: 11,
    font: fontBold,
    color: primaryIndigo,
  });

  currentY -= 15;

  const checklist = [
    { label: 'SSL / HTTPS Security Protocol', status: audit?.isHttps ? 'SECURE' : 'INSECURE / MISSING', passed: audit?.isHttps },
    { label: 'Mobile Responsive Viewport Tag', status: audit?.hasViewport ? 'COMPLIANT' : 'FAIL / NOT DETECTED', passed: audit?.hasViewport },
    { label: 'LocalBusiness Schema.org Structured Data', status: audit?.hasSchema ? 'INDEXED' : 'MISSING (MAP PACK DEFICIT)', passed: audit?.hasSchema },
    { label: '24/7 Automated Appointment / Booking Widget', status: audit?.hasBooking ? `ACTIVE (${audit.bookingProvider || 'Yes'})` : 'MISSING (AFTER-HOURS LOSS)', passed: audit?.hasBooking },
    { label: '1-Click WhatsApp / Direct Chat Funnel', status: audit?.hasWhatsApp ? 'CONFIGURED' : 'ABSENT (MOBILE BOUNCE)', passed: audit?.hasWhatsApp },
  ];

  checklist.forEach((item) => {
    currentY -= 18;
    page.drawText(item.passed ? '[+]' : '[!]', {
      x: 45,
      y: currentY,
      size: 9,
      font: fontBold,
      color: item.passed ? successGreen : alertRose,
    });

    page.drawText(item.label, {
      x: 65,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: textDark,
    });

    page.drawText(item.status || '', {
      x: 380,
      y: currentY,
      size: 8.5,
      font: fontBold,
      color: item.passed ? successGreen : alertRose,
    });
  });

  // Actionable Solution Packages
  currentY -= 35;
  page.drawText('RECOMMENDED STRATEGIC IMPLEMENTATION PACKAGES', {
    x: 40,
    y: currentY,
    size: 11,
    font: fontBold,
    color: primaryIndigo,
  });

  currentY -= 20;

  const packages = [
    {
      title: 'Tier 1: Essential Quick-Fix',
      price: '$650 one-time',
      details: 'Resolve SSL warnings, inject Schema.org JSON-LD, and install 1-tap WhatsApp chat.',
    },
    {
      title: 'Tier 2: Local Growth Engine (Recommended)',
      price: '$1,850 one-time',
      details: 'Next-gen responsive website, automated 24/7 booking calendar & Google Map Pack setup.',
    },
    {
      title: 'Tier 3: Market Dominator Retainer',
      price: '$3,200 + $500/mo',
      details: 'Full custom web redesign, ongoing Local SEO backlinks, automated SMS/WhatsApp reminders.',
    },
  ];

  packages.forEach((pkg) => {
    page.drawRectangle({
      x: 40,
      y: currentY - 32,
      width: width - 80,
      height: 44,
      color: cardBg,
      borderColor: cardBorder,
      borderWidth: 1,
    });

    page.drawText(pkg.title, {
      x: 52,
      y: currentY - 5,
      size: 9.5,
      font: fontBold,
      color: textDark,
    });

    page.drawText(pkg.price, {
      x: width - 170,
      y: currentY - 5,
      size: 9.5,
      font: fontBold,
      color: primaryIndigo,
    });

    page.drawText(pkg.details, {
      x: 52,
      y: currentY - 22,
      size: 8,
      font: fontRegular,
      color: textMuted,
    });

    currentY -= 52;
  });

  // Footer & Call to Action
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: 60,
    color: darkNavy,
  });

  page.drawText('SCHEDULE YOUR 15-MINUTE STRATEGY REVIEW', {
    x: 60,
    y: 76,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Prepared by ${agencyName} | Generated via LeadGenerator Opportunity Engine`, {
    x: 60,
    y: 56,
    size: 8,
    font: fontRegular,
    color: rgb(0.8, 0.85, 0.95),
  });

  return await pdfDoc.save();
}

export function downloadProposalPDF(pdfBytes: Uint8Array, leadName: string) {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${leadName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_growth_audit.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
