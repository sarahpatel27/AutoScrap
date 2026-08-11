import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../config/seo.config';

export default function SEO({
    title,
    description,
    canonical,
    ogImage = SITE_CONFIG.defaultOgImage,
    type = 'website',
    noIndex = false,
    schema = null
}) {
    const siteUrl = SITE_CONFIG.domain;

    const cleanCanonical = canonical
        ? canonical.startsWith('/')
            ? canonical === '/'
                ? ''
                : canonical
            : `/${canonical}`
        : '';
        
    const fullUrl = `${siteUrl}${cleanCanonical}`;

    const metaTitle = title || SITE_CONFIG.defaultTitle;
    const metaDescription = description || SITE_CONFIG.defaultDescription;

    const schemasToRender = schema
        ? Array.isArray(schema)
            ? schema.filter(Boolean)
            : [schema]
        : [];

    return (
        <Helmet>
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={fullUrl} />

            {noIndex ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            )}

            <meta property="og:site_name" content={SITE_CONFIG.name} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:locale" content="en_GB" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={ogImage} />

            {schemasToRender.map((s, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(s)}
                </script>
            ))}
        </Helmet>
    );
}