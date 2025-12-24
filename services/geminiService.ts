
import { GoogleGenAI } from "@google/genai";
import { SpecAttribute, Product, AttributeType, PriceRange, RetailerLink, AdUnit, UserLocation } from "../types";

// Always use process.env.API_KEY directly for initialization as per guidelines.
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const cleanAndParseJSON = (text: string) => {
  if (!text) return null;
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let target = text;
    if (jsonMatch) {
      target = jsonMatch[1];
    } else {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        target = text.substring(firstBrace, lastBrace + 1);
      }
    }
    return JSON.parse(target);
  } catch (e) {
    console.error("ValuNinja Parser Error:", e, "Payload:", text);
    return null;
  }
};

export interface RegionInfo {
  domain: string;
  countryName: string;
  currencySymbol: string;
  bestBuyDomain?: string;
  flag: string;
}

export const getRegionInfo = (): RegionInfo => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzLower = tz.toLowerCase();
    const canadaCities = ['toronto', 'vancouver', 'edmonton', 'winnipeg', 'halifax', 'st_johns', 'regina', 'calgary', 'ottawa', 'montreal', 'quebec', 'saskatoon', 'victoria'];
    if (tzLower.includes('canada') || canadaCities.some(city => tzLower.includes(city))) 
      return { domain: 'amazon.ca', countryName: 'Canada', currencySymbol: 'CAD', bestBuyDomain: 'bestbuy.ca', flag: '🇨🇦' };
    return { domain: 'amazon.com', countryName: 'USA', currencySymbol: '$', bestBuyDomain: 'bestbuy.com', flag: '🇺🇸' };
  } catch (e) {
    return { domain: 'amazon.com', countryName: 'USA', currencySymbol: '$', bestBuyDomain: 'bestbuy.com', flag: '🇺🇸' };
  }
};

export const resolveRegionFromLocation = async (lat: number, lng: number): Promise<RegionInfo | null> => {
  try {
    const ai = getAI();
    const prompt = `Identify the country for location: Lat ${lat}, Lng ${lng}. Return JSON with countryName, flag, domain, and currencySymbol.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0, responseMimeType: "application/json" }
    });
    const data = JSON.parse(response.text || '{}');
    return {
      countryName: data.countryName,
      flag: data.flag,
      domain: data.domain,
      currencySymbol: data.currencySymbol,
      bestBuyDomain: data.domain.includes('.ca') ? 'bestbuy.ca' : (data.domain.includes('.com') ? 'bestbuy.com' : undefined)
    };
  } catch (e) { return null; }
};

const isRealUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    if (!url.startsWith('http')) return false;
    if (url.includes('example.com') || url.includes('placeholder')) return false;
    return true;
};

const generateRetailerLinks = (product: Partial<Product>, region: RegionInfo, affiliates?: any): RetailerLink[] => {
  const links: RetailerLink[] = [];
  
  // PRIMARY SCOUT LINK (MANDATORY)
  if (product.sourceUrl && isRealUrl(product.sourceUrl)) {
    let finalUrl = product.sourceUrl;
    // Basic affiliate injection if it matches standard patterns
    if (affiliates?.impactId && !finalUrl.includes('amazon')) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + `irclickid=${affiliates.impactId}`;
    }
    links.push({ 
      name: `Strike: ${product.storeName || 'Verified Merchant'}`, 
      url: finalUrl, 
      icon: 'generic', 
      isDirect: true 
    });
  }

  // TACTICAL SECONDARY HUB
  const query = encodeURIComponent(`${product.brand} ${product.name}`);
  links.push({ name: 'Market Discovery Hub', url: `https://www.google.com/search?q=${query}&tbm=shop`, icon: 'maps' });

  // REGIONAL PRIME SCAN
  let amzUrl = `https://www.${region.domain}/s?k=${query}`;
  if (affiliates?.amazonTag) amzUrl += `&tag=${affiliates.amazonTag}`;
  links.push({ name: 'Amazon Quick Scan', url: amzUrl, icon: 'amazon' });
  
  return links;
};

export const analyzeProductCategory = async (query: string): Promise<{ attributes: SpecAttribute[], suggestions: string[], marketGuide: string, defaultValues: Record<string, any>, priceRange: PriceRange, adUnits: AdUnit[], region: RegionInfo }> => {
  const ai = getAI();
  const region = getRegionInfo();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze user search: "${query}" in ${region.countryName}. 
    
    Output JSON with EXACT keys:
    - attributes: array of objects {key, label, type, defaultValue}
    - marketGuide: a string of tactical buying advice (max 200 words). MANDATORY.
    - suggestions: array of string specs to look for
    - priceRange: {min, max, currency}
    - adUnits: 2 objects {brand, headline, description, cta}
    `,
    config: { temperature: 0, responseMimeType: "application/json" }
  });

  const data = JSON.parse(response.text || '{}');
  const attributes = (data.attributes || []).map((attr: any) => ({
    ...attr,
    type: attr.type === 'NUMBER' ? AttributeType.NUMBER : (attr.type === 'BOOLEAN' ? AttributeType.BOOLEAN : AttributeType.STRING)
  }));
  
  const marketGuide = data.marketGuide || `Tactical analysis for ${query} is active. Scouting based on high-performance specifications and market availability in ${region.countryName}.`;
  
  const defaultValues: Record<string, any> = { minPrice: 0, maxPrice: null, customQuery: '' };
  attributes.forEach((a: any) => { if (a.defaultValue) defaultValues[a.key] = a.defaultValue; });

  return { attributes, suggestions: data.suggestions || [], marketGuide, defaultValues, priceRange: data.priceRange, adUnits: data.adUnits || [], region };
};

export const searchProducts = async (query: string, userValues: Record<string, any>, location?: UserLocation, affiliates?: any): Promise<{ products: Product[], summary: string, sources: { title: string, uri: string }[], region: RegionInfo }> => {
  const region = getRegionInfo();
  const ai = getAI();
  
  const prompt = `
    Mission: Identify top 4 specific products or services (e.g., exact cruise packages, laptops, hotels) for: "${query}" in ${region.countryName}.
    Filters: ${JSON.stringify(userValues)}
    
    CRITICAL INSTRUCTION: For EVERY result, you MUST provide the exact URL ('sourceUrl') where this pricing or package was identified. Do not provide placeholder links. Use Google Search grounding to find the real merchant page.
    
    Output strictly as JSON.
    {
      "summary": "Overall market status",
      "products": [{
        "brand": "Brand or Provider", 
        "name": "Exact Product/Package Name", 
        "price": number, 
        "currency": "${region.currencySymbol}", 
        "storeName": "Merchant Name",
        "sourceUrl": "MANDATORY: REAL URL to merchant/booking page",
        "description": "Short tactical analysis", 
        "specs": {}, 
        "pros": [], 
        "cons": [], 
        "valueScore": 1-100,
        "valueBreakdown": {
          "performance": 1-10, "buildQuality": 1-10, "featureSet": 1-10, "reliability": 1-10, 
          "userSatisfaction": 1-10, "efficiency": 1-10, "innovation": 1-10, "longevity": 1-10, 
          "ergonomics": 1-10, "dealStrength": 1-10
        }
      }]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        temperature: 0,
        thinkingConfig: { thinkingBudget: 8192 }
      }
    });

    const data = cleanAndParseJSON(response.text || '');
    if (!data || !Array.isArray(data.products)) throw new Error("Scout telemetry corrupted.");

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = chunks.map(c => {
      const uri = c.web?.uri || c.maps?.uri;
      const title = c.web?.title || c.maps?.title || "";
      if (uri && isRealUrl(uri)) return { title, uri };
      return null;
    }).filter((s): s is { title: string, uri: string } => !!s);

    const products = data.products.map((p: any) => {
      const defaultBreakdown = { 
        performance: 7, buildQuality: 7, featureSet: 7, reliability: 7, 
        userSatisfaction: 7, efficiency: 7, innovation: 7, longevity: 7, 
        ergonomics: 7, dealStrength: 7 
      };
      
      // Attempt to verify/refine sourceUrl if the model provided one, or match from grounding
      let verifiedUrl = p.sourceUrl;
      if (!isRealUrl(verifiedUrl)) {
          const brandLower = (p.brand || "").toLowerCase();
          const bestMatch = groundingSources.find(src => src.title.toLowerCase().includes(brandLower));
          if (bestMatch) verifiedUrl = bestMatch.uri;
      }

      return {
          ...p,
          id: Math.random().toString(36).substr(2, 9),
          sourceUrl: verifiedUrl,
          specs: p.specs || {},
          pros: Array.isArray(p.pros) ? p.pros : [],
          cons: Array.isArray(p.cons) ? p.cons : [],
          valueScore: p.valueScore || 75,
          valueBreakdown: { ...defaultBreakdown, ...(p.valueBreakdown || {}) },
          retailers: generateRetailerLinks({ ...p, sourceUrl: verifiedUrl }, region, affiliates)
      };
    });

    return { products, summary: data.summary || "Strike results generated.", sources: groundingSources, region };
  } catch (error: any) { throw error; }
};
