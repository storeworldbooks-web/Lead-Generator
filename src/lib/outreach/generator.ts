import { Lead } from '@/types';
import { formatCurrency, getWhatsAppLink, getMailtoLink } from '@/utils';

export interface OutreachPackage {
  whatsApp: {
    text: string;
    directUrl: string;
  };
  email: {
    subjectVariants: string[];
    body: string;
    mailtoUrl: string;
  };
  linkedIn: {
    connectionNote: string;
    inMailMessage: string;
  };
}

export function generateOutreachCopy(lead: Lead, agencyName: string = 'Digital Apex Studio', senderName: string = 'Alex'): OutreachPackage {
  const audit = lead.auditReport;
  const isNoWebsite = !lead.website || (audit && audit.status === 'NO_WEBSITE');
  const leakFormatted = formatCurrency(audit ? audit.estimatedMonthlyLeakUSD : lead.estimatedDealValue);

  // Identify top pain point
  let primaryFlaw = 'missing local mobile search capture';
  let specificPitch = 'a modern local client acquisition funnel';

  if (isNoWebsite) {
    primaryFlaw = 'having zero official website presence when customers search online';
    specificPitch = 'a high-converting, mobile-ready website with 24/7 client booking';
  } else if (audit && !audit.isHttps) {
    primaryFlaw = 'your website triggering a "Not Secure" warning in visitors\' browsers';
    specificPitch = 'a rapid SSL fix and mobile SEO overhaul to restore visitor trust';
  } else if (audit && !audit.hasBooking) {
    primaryFlaw = 'missing an online 24/7 appointment scheduling portal';
    specificPitch = 'an automated booking system that turns after-hours visitors into booked appointments';
  } else if (audit && !audit.hasSchema) {
    primaryFlaw = 'missing LocalBusiness Schema markup required to rank in the Google Map Pack';
    specificPitch = 'a technical Local SEO tune-up to outrank competing providers in ' + lead.city;
  }

  // 1. WhatsApp Text
  const whatsAppText = `Hi ${lead.name} team! 👋

I was looking up top-rated ${lead.category} services in ${lead.city} and noticed a quick opportunity with your online setup: ${primaryFlaw}.

Local competitors are capturing around ${leakFormatted}/mo in high-ticket bookings by fixing this.

I put together a complimentary 2-page growth audit showing exactly how to fix it with ${specificPitch}. 

Would it be okay if I sent the PDF over here for you to review?

Best,
${senderName} | ${agencyName}`;

  // 2. Email Copy
  const subjectVariants = [
    `Quick observation regarding ${lead.name}'s search presence in ${lead.city}`,
    `Potential ${leakFormatted}/mo revenue leak spotted for ${lead.name}`,
    `${lead.name} - complimentary Local SEO & conversion audit`,
  ];

  const emailBody = `Hi ${lead.name} Team,

I recently audited the digital presence of local ${lead.category} businesses across ${lead.city}, and wanted to share a few findings regarding ${lead.name}.

During our scan, we identified:
• ${primaryFlaw.toUpperCase()}
• Estimated missed revenue: approx. ${leakFormatted}/month
• Direct impact: Prospective clients visiting from mobile or Google Maps are bouncing to neighboring competitors.

We generated a comprehensive Executive Audit & Opportunity Roadmap detailing how implementing ${specificPitch} will immediately increase your booked consultations.

Would you be open to reviewing the PDF proposal this week? If so, reply "YES" and I'll send it straight over.

Warm regards,

${senderName}
Founder, ${agencyName}
Direct: ${lead.phone || '+1 (555) 019-2831'}
Website: https://locallead.ai`;

  // 3. LinkedIn Copy
  const linkedInConnection = `Hi team, came across ${lead.name} while researching top ${lead.category} providers in ${lead.city}. Spotted a quick conversion boost regarding your online presence and wanted to connect!`;

  const linkedInInMail = `Subject: Growth opportunity for ${lead.name}

Hi there,

Hope you are having a productive week.

I run a digital consultancy specializing in scaling local ${lead.category} businesses. While evaluating the ${lead.city} market, I noticed ${primaryFlaw} for ${lead.name}.

We recently helped a similar service provider recapture ${leakFormatted}/month by deploying ${specificPitch}.

I prepared a custom PDF breakdown for your review. Are you open to taking a look?

Best regards,
${senderName}`;

  return {
    whatsApp: {
      text: whatsAppText,
      directUrl: getWhatsAppLink(lead.phone, whatsAppText),
    },
    email: {
      subjectVariants,
      body: emailBody,
      mailtoUrl: getMailtoLink(lead.email, subjectVariants[0], emailBody),
    },
    linkedIn: {
      connectionNote: linkedInConnection,
      inMailMessage: linkedInInMail,
    },
  };
}
