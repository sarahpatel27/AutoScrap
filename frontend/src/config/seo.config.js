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
    googleProfile: 'https://share.google/lppdUTbhDohi0FX8O',
    trustpilot: 'https://www.trustpilot.com/review/myautoscrap.co.uk'
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
    logo: `${SITE_CONFIG.domain}/myautoscraplogo.png`,
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
 * Generate Schema.org JSON-LD for Service in a given location / service area
 */
export function getServiceLocationSchema(location) {
  const cityName = location?.city || 'UK';
  const slug = location?.slug ? `/areas-we-cover/${location.slug}` : '/areas-we-cover';

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_CONFIG.domain}${slug}#service`,
    name: `Scrap Car Collection in ${cityName}`,
    serviceType: 'Scrap Car Collection',
    url: `${SITE_CONFIG.domain}${slug}`,
    description: `Free vehicle collection and scrap car disposal across supported areas in and around ${cityName}.`,
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.domain}/#organization`,
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.domain,
      telephone: SITE_CONFIG.telephone
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: cityName
    }
  };
}

// Backward-compatible alias
export const getLocalBusinessSchema = getServiceLocationSchema;

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

/**
 * Generate Schema.org JSON-LD for ItemList (e.g. collection locations)
 */
export function getItemListSchema(items, name = 'Supported Scrap Car Collection Areas') {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${SITE_CONFIG.domain}${item.url}`
    }))
  };
}

/**
 * Generate Schema.org JSON-LD for ContactPage
 */
export function getContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE_CONFIG.domain}/contact-us#webpage`,
    url: `${SITE_CONFIG.domain}/contact-us`,
    name: 'Contact MyAutoScrap',
    description: 'Get in touch with the MyAutoScrap customer support team for scrap car valuation and collection enquiries.',
    mainEntity: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      telephone: SITE_CONFIG.telephone,
      url: SITE_CONFIG.domain,
      sameAs: [SITE_CONFIG.social.googleProfile]
    }
  };
}
