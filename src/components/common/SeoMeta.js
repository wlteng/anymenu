import React from 'react';
import { Helmet } from 'react-helmet';

const SeoMeta = ({ shop }) => {
  if (!shop) return null;

  const title = shop.seoTitle || shop.name;
  const description = shop.seoDescription || shop.description || `Menu for ${shop.name}`;
  const ogTitle = shop.ogTitle || title;
  const ogDescription = shop.ogDescription || description;
  const ogImage = shop.ogImage || shop.squareLogo;
  const keywords = shop.keywords || '';
  const websiteUrl = shop.websiteUrl || '';

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {websiteUrl && <meta property="og:url" content={websiteUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Social Media Links */}
      {shop.facebookUrl && <link rel="me" href={shop.facebookUrl} />}
      {shop.twitterUrl && <link rel="me" href={shop.twitterUrl} />}
      {shop.instagramUrl && <link rel="me" href={shop.instagramUrl} />}
      {websiteUrl && <link rel="canonical" href={websiteUrl} />}
    </Helmet>
  );
};

export default SeoMeta;