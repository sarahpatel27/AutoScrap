export const SITE_CONFIG = {
  name: 'MyAutoScrap',
  domain: 'https://www.myautoscrap.co.uk',
  defaultTitle: 'Scrap My Car | Instant Scrap Car Quote & Free Collection | MyAutoScrap',
  defaultDescription: 'Get an instant competitive scrap car estimate and arrange free nationwide collection across the UK with MyAutoScrap. Fast, simple, and reliable.',
  defaultOgImage: 'https://www.myautoscrap.co.uk/og-image.jpg',
  telephone: '+447714423293',
  priceRange: '££',
  address: {
    country: 'UK',
  },
  social: {
    whatsapp: 'https://wa.me/447714423293',
    googleProfile: 'https://share.google/lppdUTbhDohi0FX8O'
  }
};

/**
 * Generate Schema.org JSON-LD for Organization
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.domain}/#organization`,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.domain,
    logo: `${SITE_CONFIG.domain}/logo.png`,
    description: SITE_CONFIG.defaultDescription,
    telephone: SITE_CONFIG.telephone,
    sameAs: [SITE_CONFIG.social.googleProfile]
  };
}

/**
 * Generate Schema.org JSON-LD for WebSite with Sitelinks Searchbox
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.domain}/#website`,
    url: SITE_CONFIG.domain,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.defaultDescription,
    publisher: {
      '@id': `${SITE_CONFIG.domain}/#organization`
    }
  };
}

/**
 * Generate Schema.org JSON-LD for LocalBusiness / AutoRepair service
 */
export function getLocalBusinessSchema(location) {
  const cityName = location?.city || 'UK';
  const slug = location?.slug ? `/areas-we-cover/${location.slug}` : '/areas-we-cover';
  const areasList = location?.areas ? location.areas.join(', ') : 'Nationwide UK';

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    '@id': `${SITE_CONFIG.domain}${slug}#localbusiness`,
    name: `MyAutoScrap - Scrap Car Collection ${cityName}`,
    url: `${SITE_CONFIG.domain}${slug}`,
    telephone: SITE_CONFIG.telephone,
    priceRange: SITE_CONFIG.priceRange,
    description: `Professional scrap car buying and free vehicle collection service operating in ${cityName} and surrounding areas (${areasList}).`,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: cityName
    },
    provider: {
      '@id': `${SITE_CONFIG.domain}/#organization`
    }
  };
}

/**
 * Generate Schema.org JSON-LD for FAQPage
 */
export function getFaqPageSchema(faqItems) {
  if (!faqItems || !Array.isArray(faqItems)) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  };
}

/**
 * Generate Schema.org JSON-LD for BreadcrumbList
 */
export function getBreadcrumbSchema(breadcrumbs) {
  if (!breadcrumbs || !Array.isArray(breadcrumbs)) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_CONFIG.domain}${item.url}`
    }))
  };
}
