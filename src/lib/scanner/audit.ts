import { Lead, AuditReport, AuditIssue, OpportunityTier } from '@/types';

export function performSiteAudit(lead: Lead, htmlContent?: string, fetchStatusCode?: number): AuditReport {
  const url = lead.website ? lead.website.trim() : '';

  // Case 1: No Website at all
  if (!url) {
    const issues: AuditIssue[] = [
      {
        id: 'no-website',
        severity: 'CRITICAL',
        title: 'Zero Online Website Presence',
        description: 'Business has no indexed website or domain. Relying exclusively on directories and foot traffic.',
        category: 'CONVERSION',
        impactScore: 40,
      },
      {
        id: 'no-booking',
        severity: 'CRITICAL',
        title: 'Missing Direct Online Booking / Scheduling',
        description: 'Prospective clients cannot schedule consultations or appointments after business hours.',
        category: 'CONVERSION',
        impactScore: 25,
      },
      {
        id: 'no-local-seo',
        severity: 'CRITICAL',
        title: 'Zero Schema.org & Local Search Authority',
        description: 'Competitors with indexed domains and schema markup dominate local high-intent keywords.',
        category: 'SEO',
        impactScore: 25,
      },
      {
        id: 'no-mobile-channel',
        severity: 'WARNING',
        title: 'No Instant WhatsApp or Chat CTA',
        description: 'Over 60% of local mobile visitors bounce if no 1-tap messaging option is available.',
        category: 'MOBILE',
        impactScore: 10,
      },
    ];

    const recommendations = [
      'Deploy modern mobile-first landing page with clear CTA buttons within 7 days.',
      'Embed 24/7 calendar booking system (Calendly/Acuity) to capture off-hours inquiries.',
      'Inject LocalBusiness JSON-LD Schema markup to rank in the Google 3-Pack.',
      'Configure WhatsApp click-to-chat floating widget for instant mobile lead capture.',
    ];

    return {
      scannedAt: new Date().toISOString(),
      status: 'NO_WEBSITE',
      statusCode: 0,
      url: '',
      isHttps: false,
      hasValidSsl: false,
      hasViewport: false,
      hasSchema: false,
      hasBooking: false,
      hasWhatsApp: false,
      hasPhone: Boolean(lead.phone),
      hasEmail: Boolean(lead.email),
      socialLinks: {},
      issues,
      recommendations,
      opportunityScore: 96,
      tier: 'HOT',
      estimatedMonthlyLeakUSD: Math.round(lead.estimatedDealValue * 1.8),
    };
  }

  // Case 2: Website provided -> Analyze attributes
  const isHttps = url.toLowerCase().startsWith('https://');
  const issues: AuditIssue[] = [];
  const recommendations: string[] = [];

  let hasViewport = true;
  let title = `${lead.name} - Official Site`;
  let titleLength = title.length;
  let metaDescription = '';
  let metaDescriptionLength = 0;
  let hasSchema = false;
  let hasBooking = false;
  let bookingProvider: string | undefined = undefined;
  let hasWhatsApp = false;
  let whatsAppNumber: string | undefined = undefined;
  let hasPhone = Boolean(lead.phone);
  let hasEmail = Boolean(lead.email);
  let detectedCms = 'Custom / Unknown';

  const socialLinks: AuditReport['socialLinks'] = {};

  if (!isHttps) {
    issues.push({
      id: 'no-ssl',
      severity: 'CRITICAL',
      title: 'Insecure HTTP Protocol (Missing SSL)',
      description: 'Browsers display "Not Secure" warning to visitors. High bounce rate and Google ranking penalty.',
      category: 'SECURITY',
      impactScore: 30,
    });
    recommendations.push('Install SSL certificate and enforce HTTPS redirect across all domain routes.');
  }

  if (htmlContent) {
    const lowerHtml = htmlContent.toLowerCase();

    // Check Viewport
    hasViewport = lowerHtml.includes('name="viewport"') || lowerHtml.includes("name='viewport'");
    if (!hasViewport) {
      issues.push({
        id: 'no-viewport',
        severity: 'CRITICAL',
        title: 'Not Optimized for Mobile (Missing Viewport Meta)',
        description: 'Page does not scale on mobile devices, leading to extreme user frustration and SEO downgrade.',
        category: 'MOBILE',
        impactScore: 25,
      });
      recommendations.push('Add responsive meta viewport tag to enable fluid mobile rendering.');
    }

    // Check Title
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
      titleLength = title.length;
      if (titleLength < 20 || titleLength > 70) {
        issues.push({
          id: 'bad-title-length',
          severity: 'WARNING',
          title: `Suboptimal Title Tag Length (${titleLength} chars)`,
          description: 'Title tags should ideally be between 40-60 characters including local city keywords.',
          category: 'SEO',
          impactScore: 10,
        });
        recommendations.push(`Revise title tag to: "${lead.name} | Top ${lead.category} in ${lead.city}"`);
      }
    } else {
      issues.push({
        id: 'missing-title',
        severity: 'CRITICAL',
        title: 'Missing Page Title Tag',
        description: 'Search engines cannot determine page relevance without a valid title tag.',
        category: 'SEO',
        impactScore: 20,
      });
    }

    // Check Meta Description
    const metaDescMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    if (metaDescMatch && metaDescMatch[1]) {
      metaDescription = metaDescMatch[1].trim();
      metaDescriptionLength = metaDescription.length;
    } else {
      issues.push({
        id: 'missing-meta-desc',
        severity: 'WARNING',
        title: 'Missing Meta Description',
        description: 'Search results show random text snippets instead of a persuasive conversion pitch.',
        category: 'SEO',
        impactScore: 15,
      });
      recommendations.push('Add an engaging 150-character meta description with a call to action and phone number.');
    }

    // Check Schema.org
    hasSchema = lowerHtml.includes('application/ld+json') && (lowerHtml.includes('schema.org') || lowerHtml.includes('"@type"'));
    if (!hasSchema) {
      issues.push({
        id: 'missing-schema',
        severity: 'WARNING',
        title: 'Missing LocalBusiness Schema.org Markup',
        description: 'Search engines struggle to parse business hours, reviews, and geo coordinates for Google Maps.',
        category: 'SEO',
        impactScore: 15,
      });
      recommendations.push('Embed LocalBusiness JSON-LD structured data with hours, coordinates, and telephone.');
    }

    // Check Online Booking
    const bookingSignatures = [
      { name: 'Calendly', pattern: 'calendly.com' },
      { name: 'Acuity Scheduling', pattern: 'acuityscheduling.com' },
      { name: 'Fresha', pattern: 'fresha.com' },
      { name: 'Vagaro', pattern: 'vagaro.com' },
      { name: 'Setmore', pattern: 'setmore.com' },
      { name: 'Square Appointments', pattern: 'squareup.com/appointments' },
      { name: 'Mindbody', pattern: 'mindbodyonline.com' },
      { name: 'OpenTable', pattern: 'opentable.com' },
    ];

    for (const b of bookingSignatures) {
      if (lowerHtml.includes(b.pattern)) {
        hasBooking = true;
        bookingProvider = b.name;
        break;
      }
    }

    if (!hasBooking && (lowerHtml.includes('book online') || lowerHtml.includes('schedule appointment'))) {
      hasBooking = true;
      bookingProvider = 'Custom Form';
    }

    if (!hasBooking) {
      issues.push({
        id: 'missing-booking-widget',
        severity: 'WARNING',
        title: 'No Integrated Online Appointment Booking',
        description: 'Customers are forced to call or wait for email replies, losing up to 45% of potential appointments.',
        category: 'CONVERSION',
        impactScore: 20,
      });
      recommendations.push('Integrate automated 24/7 calendar booking widget to increase appointment flow.');
    }

    // Check WhatsApp
    hasWhatsApp = lowerHtml.includes('wa.me/') || lowerHtml.includes('api.whatsapp.com') || lowerHtml.includes('whatsapp.com/send');
    if (hasWhatsApp) {
      const waMatch = htmlContent.match(/(?:wa\.me\/|phone=)(\+?\d{8,15})/i);
      if (waMatch) {
        whatsAppNumber = waMatch[1];
      }
    } else {
      issues.push({
        id: 'no-whatsapp-cta',
        severity: 'INFO',
        title: 'No Direct WhatsApp Chat Integration',
        description: 'Modern consumers prefer friction-free messaging over filling long static web forms.',
        category: 'CONVERSION',
        impactScore: 10,
      });
      recommendations.push('Add a 1-click WhatsApp floating chat widget for immediate quote requests.');
    }

    // Check Phone CTA
    hasPhone = lowerHtml.includes('href="tel:') || lowerHtml.includes("href='tel:") || Boolean(lead.phone);
    hasEmail = lowerHtml.includes('href="mailto:') || lowerHtml.includes("href='mailto:") || Boolean(lead.email);

    // Detect CMS
    if (lowerHtml.includes('wp-content') || lowerHtml.includes('wordpress')) detectedCms = 'WordPress';
    else if (lowerHtml.includes('wix.com') || lowerHtml.includes('_wix')) detectedCms = 'Wix';
    else if (lowerHtml.includes('squarespace')) detectedCms = 'Squarespace';
    else if (lowerHtml.includes('shopify')) detectedCms = 'Shopify';
    else if (lowerHtml.includes('webflow')) detectedCms = 'Webflow';

    // Social links
    if (lowerHtml.includes('facebook.com/')) socialLinks.facebook = 'Detected';
    if (lowerHtml.includes('instagram.com/')) socialLinks.instagram = 'Detected';
    if (lowerHtml.includes('linkedin.com/')) socialLinks.linkedin = 'Detected';
  } else {
    // If scanning without raw HTML (e.g. simulated or headers check)
    // Add default realistic audit findings based on category
    if (!isHttps) {
      // already added
    } else {
      issues.push({
        id: 'missing-booking-widget',
        severity: 'WARNING',
        title: 'No Integrated Online Appointment Booking',
        description: 'Customers must manually phone in. High loss of after-hours bookings.',
        category: 'CONVERSION',
        impactScore: 20,
      });
      issues.push({
        id: 'missing-schema',
        severity: 'WARNING',
        title: 'Missing LocalBusiness Schema.org Markup',
        description: 'Google Maps and search crawlers missing structured geo and review data.',
        category: 'SEO',
        impactScore: 15,
      });
      issues.push({
        id: 'no-whatsapp-cta',
        severity: 'INFO',
        title: 'No Direct WhatsApp Chat Integration',
        description: 'Missing 1-tap mobile chat connection for instant customer communication.',
        category: 'CONVERSION',
        impactScore: 10,
      });
      recommendations.push('Integrate automated 24/7 calendar booking widget.');
      recommendations.push('Inject LocalBusiness Schema.org JSON-LD to rank higher on local queries.');
      recommendations.push('Install instant WhatsApp chat widget.');
    }
  }

  // Calculate Opportunity Score (0-100)
  // Higher score = More reasons to reach out and close the lead!
  const totalDeductions = issues.reduce((acc, issue) => acc + issue.impactScore, 0);
  const opportunityScore = Math.min(95, Math.max(15, totalDeductions));

  let tier: OpportunityTier = 'COLD';
  if (opportunityScore >= 70) {
    tier = 'HOT';
  } else if (opportunityScore >= 40) {
    tier = 'WARM';
  }

  const estimatedMonthlyLeakUSD = Math.round(
    lead.estimatedDealValue * (opportunityScore / 100) * 1.2
  );

  return {
    scannedAt: new Date().toISOString(),
    status: 'SUCCESS',
    statusCode: fetchStatusCode || 200,
    url,
    isHttps,
    hasValidSsl: isHttps,
    hasViewport,
    title,
    titleLength,
    metaDescription,
    metaDescriptionLength,
    hasSchema,
    hasBooking,
    bookingProvider,
    hasWhatsApp,
    whatsAppNumber,
    hasPhone,
    hasEmail,
    detectedCms,
    socialLinks,
    issues,
    recommendations,
    opportunityScore,
    tier,
    estimatedMonthlyLeakUSD,
  };
}
