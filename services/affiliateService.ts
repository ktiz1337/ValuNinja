
import { RetailerLink } from '../types';

interface AffiliateConfig {
  amazonTag: string;
  ebayId: string;
  bestBuyId: string;
  impactId: string;
  walmartId?: string;
  targetId?: string;
  neweggId?: string;
}

export const wrapAffiliateLink = (url: string, config: AffiliateConfig): string => {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();

    // Amazon
    if (host.includes('amazon.')) {
      if (config.amazonTag) {
        urlObj.searchParams.set('tag', config.amazonTag);
      }
      return urlObj.toString();
    }

    // eBay
    if (host.includes('ebay.')) {
      if (config.ebayId) {
        urlObj.searchParams.set('mkevt', '1');
        urlObj.searchParams.set('mkcid', '1');
        urlObj.searchParams.set('mkrid', config.ebayId);
      }
      return urlObj.toString();
    }

    // Impact Radius Retailers (Best Buy, Walmart, Target, Newegg)
    const impactRetailers = [
      { name: 'bestbuy', id: config.bestBuyId || config.impactId },
      { name: 'walmart', id: config.walmartId || config.impactId },
      { name: 'target', id: config.targetId || config.impactId },
      { name: 'newegg', id: config.neweggId || config.impactId }
    ];

    for (const retailer of impactRetailers) {
      if (host.includes(retailer.name) && retailer.id) {
        // Impact links usually wrap the URL or use a click ID
        if (url.includes('?')) {
          return `${url}&irclickid=${retailer.id}`;
        }
        return `${url}?irclickid=${retailer.id}`;
      }
    }

    return url;
  } catch (e) {
    return url;
  }
};

export const scrubProductLinks = (links: RetailerLink[], config: AffiliateConfig): RetailerLink[] => {
  return links.map(link => ({
    ...link,
    url: wrapAffiliateLink(link.url, config)
  }));
};
