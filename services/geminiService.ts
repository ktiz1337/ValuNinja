
import { GoogleGenAI, Type } from "@google/genai";
import { SpecAttribute, Product, AttributeType, PriceRange, RetailerLink, AdUnit, UserLocation } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("VALUNINJA_SECURITY: API_KEY not detected in environment.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

const cleanAndParseJSON = (text: string) => {
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
    console.error("Critical JSON Parse Error:", e, "Raw Text:", text);
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
    const prompt = `Identify the country for location: Lat ${lat}, Lng ${lng}. Return JSON with countryName, flag (emoji), domain (Amazon domain like amazon.ca), and currencySymbol.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0,
        responseMimeType: "application/json"
      }
    });
    const data = JSON.parse(response.text || '{}');
    return {
      countryName: data.countryName,
      flag: data.flag,
      domain: data.domain,
      currencySymbol: data.currencySymbol,
      bestBuyDomain: data.domain.includes('.ca') ? 'bestbuy.ca' : (data.domain.includes('.com') ? 'bestbuy.com' : undefined)
    };
  } catch (e) {
    return null;
  }
};

const isRealUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    if (!url.startsWith('http')) return false;
    if (url.includes('example.com') || url.includes('placeholder')) return false;
    return true;
};

const generateRetailerLinks = (product: Partial<Product>, region: RegionInfo, affiliates?: any): RetailerLink[] => {
  const links: RetailerLink[] = [];
  const queryText = `${product.brand} ${product.name}`;
  const query = encodeURIComponent(queryText);
  
  if (product.directUrl && isRealUrl(product.directUrl)) {
    let finalUrl = product.directUrl;
    if (affiliates?.impactId && !finalUrl.includes('amazon')) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + `irclickid=${affiliates.impactId}`;
    }

    links.push({
      name: `Direct: ${product.storeName || 'Merchant'}`,
      url: finalUrl,
      icon: 'generic',
      isDirect: true
    });
  }

  links.push({ 
    name: 'Tactical Hub (Google Shopping)', 
    url: `https://www.google.com/search?q=${query}&tbm=shop`, 
    icon: 'maps' 
  });

  let amzUrl = `https://www.${region.domain}/s?k=${query}`;
  if (affiliates?.amazonTag) {
    amzUrl += `&tag=${affiliates.amazonTag}`;
  }
  
  links.push({ 
    name: 'Amazon Prime Scan', 
    url: amzUrl, 
    icon: 'amazon' 
  });
  
  return links;
};

export const analyzeProductCategory = async (query: string): Promise<{ attributes: SpecAttribute[], suggestions: string[], marketGuide: string, defaultValues: Record<string, any>, priceRange: PriceRange, adUnits: AdUnit[], region: RegionInfo }> => {
  const ai = getAI();
  const region = getRegionInfo();
  const prompt = `User in ${region.countryName} looking for: "${query}". Generate attributes, tactical brief, suggestions, price range, and 2 search-relevant ad units. Output JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0,
      responseMimeType: "application/json"
    }
  });

  const data = JSON.parse(response.text || '{}');
  const attributes = data.attributes || [];
  const defaultValues: Record<string, any> = { minPrice: 0, maxPrice: null, customQuery: '' };
  attributes.forEach((a: any) => { if (a.defaultValue) defaultValues[a.key] = a.defaultValue; });

  return { attributes, suggestions: data.suggestions || [], marketGuide: data.marketGuide || "", defaultValues, priceRange: data.priceRange, adUnits: data.adUnits || [], region };
};

export const searchProducts = async (query: string, userValues: Record<string, any>, location?: UserLocation, affiliates?: any): Promise<{ products: Product[], summary: string, sources: { title: string, uri: string }[], region: RegionInfo }> => {
  const ai = getAI();
  const region = getRegionInfo();
  
  const prompt = `
    Mission: Identify top 4 real-world products matching: "${query}" for a user in ${region.countryName}.
    Constraints: 
    - Use Google Search to find current prices and merchants. 
    - Preference for items in stock.
    - Output must be valid JSON in this exact structure:
    {
      "products": [
        {
          "brand": "string",
          "name": "string",
          "price": number,
          "currency": "${region.currencySymbol}",
          "storeName": "string",
          "description": "short tactical brief",
          "specs": { "key": "value" },
          "pros": ["string"],
          "cons": ["string"],
          "valueScore": 1-100,
          "valueBreakdown": {
            "performance": 1-10,
            "buildQuality": 1-10,
            "featureSet": 1-10,
            "reliability": 1-10,
            "userSatisfaction": 1-10,
            "efficiency": 1-10,
            "innovation": 1-10,
            "longevity": 1-10,
            "ergonomics": 1-10,
            "dealStrength": 1-10
          }
        }
      ],
      "summary": "Tactical summary of the current market state"
    }
    
    User Filters: ${JSON.stringify(userValues)}
    Tactical Objective: Find the absolute best value-to-performance ratio.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', 
    contents: prompt,
    config: { 
      tools: [{ googleSearch: {} }],
      temperature: 0
    }
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundingSources = chunks.map(c => {
    const uri = c.web?.uri || c.maps?.uri;
    const title = c.web?.title || c.maps?.title || "";
    if (uri && isRealUrl(uri)) return { title, uri };
    return null;
  }).filter((s): s is { title: string, uri: string } => !!s);

  const data = cleanAndParseJSON(response.text || '');
  if (!data || !Array.isArray(data.products)) {
    console.error("No valid products array in AI response:", response.text);
    throw new Error("Tactical reconnaissance failed. AI returned invalid data structure.");
  }

  const products = data.products.map((p: any) => {
    // Try to link a grounded source to the product
    const bestMatch = groundingSources.find(src => 
      src.title.toLowerCase().includes((p.brand || "").toLowerCase()) && 
      (src.title.toLowerCase().includes((p.storeName || "").toLowerCase()) || src.title.toLowerCase().includes((p.name || "").toLowerCase().split(' ')[0]))
    );

    const verifiedUrl = bestMatch ? bestMatch.uri : undefined;

    return {
        ...p,
        id: Math.random().toString(36).substr(2, 9),
        directUrl: verifiedUrl,
        specs: p.specs || {},
        retailers: generateRetailerLinks({ ...p, directUrl: verifiedUrl }, region, affiliates)
    };
  });

  return { products, summary: data.summary || "Reconnaissance complete.", sources: groundingSources, region };
};
