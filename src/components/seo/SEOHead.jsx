import { useEffect } from 'react';

const SEOHead = ({ title = 'CharlitexMobileConnect - Free International Calls to 155+ Countries', description = 'Connect with loved ones worldwide with unlimited international calls to 155+ countries. Starting at $15/month with crystal-clear voice quality and unbeatable prices.', keywords = 'international calls, free calls, VoIP, mobile connect, cheap international calling, unlimited calls, global calling, phone service', canonical = 'https://charlitexmobile.com/', ogImage = 'https://charlitexmobile.com/og-image.png', twitterImage = 'https://charlitexmobile.com/twitter-image.png' }) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    }

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonical);
      document.head.appendChild(canonicalLink);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonical);

    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) ogImageTag.setAttribute('content', ogImage);

    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', title);

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', description);

    const twitterImageTag = document.querySelector('meta[property="twitter:image"]');
    if (twitterImageTag) twitterImageTag.setAttribute('content', twitterImage);

    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute('content', canonical);
  }, [title, description, keywords, canonical, ogImage, twitterImage]);

  return null; // This component doesn't render anything
};

export default SEOHead;
