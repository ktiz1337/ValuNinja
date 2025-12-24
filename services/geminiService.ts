
import { GoogleGenAI } from "@google/genai";
import { SpecAttribute, Product, AttributeType, PriceRange, RetailerLink, AdUnit, UserLocation } from "../types";

// The API key is sourced exclusively from the environment.
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey.length < 5) {
    throw new Error("API_KEY_MISSING: The system could not detect a valid API key in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Robust JSON cleaner that handles markdown blocks, trailing commas, 
 * and model chatter before/after the JSON block.
 */
const cleanAndParseJSON = (text: string) => {
  if (!text) return null;
  try {
    // Attempt 1: Direct parse
    return JSON.parse(text);
  } catch (e) {
    try {
      // Attempt 2: Extract from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let target = text;
      if (jsonMatch) {
        target = jsonMatch[1];
      } else {
        // Attempt 3: Find first { and last }
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        
        const start = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
        const end = (lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket)) ? lastBrace : lastBracket;

        if (start !== -1 && end !== -1) {
          target = text.substring(start, end + 1);
        }
      }
      
      // Clean up common issues like trailing commas before closing braces
      const cleaned = target
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/(\r\n|\n|\r)/gm, " ");
        
      return JSON.parse(cleaned);
    } catch (innerError) {
      console.error("ValuNinja Parser Critical Failure:", innerError, "Payload:", text);
      return null;
    }
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
  const query = encodeURIComponent(`${product.brand} ${product.name}`);
  
  if (product.sourceUrl && isRealUrl(product.sourceUrl)) {
    let finalUrl = product.sourceUrl;
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

  links.push({ name: 'Market Discovery Hub', url: `https://www.google.com/search?q=${query}&tbm=shop`, icon: 'maps' });

  let amzUrl = `https://www.${region.domain}/s?k=${query}`;
  if (affiliates?.amazonTag) amzUrl += `&tag=${affiliates.amazonTag}`;
  links.push({ name: 'Amazon Quick Scan', url: amzUrl, icon: 'amazon' });
  
  return links;
};

export const analyzeProductCategory = async (query: string): Promise<{ attributes: SpecAttribute[], suggestions: string[], marketGuide: string, defaultValues: Record<string, any>, priceRange: PriceRange, adUnits: AdUnit[], region: RegionInfo }> => {
  const ai = getAI();
  const region = getRegionInfo();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Mission: Analyze "${query}" in ${region.countryName}. 
      Define 4 key technical attributes to compare for this product/service. 
      
      Return strictly JSON:
      {
        "attributes": [{"key": "string", "label": "string", "type": "NUMBER|STRING|BOOLEAN", "defaultValue": "any"}],
        "marketGuide": "2-3 sentences of tactical advice",
        "suggestions": ["specific spec 1", "specific spec 2"],
        "priceRange": {"min": number, "max": number, "currency": "string"},
        "adUnits": [{"brand": "string", "headline": "string", "description": "string", "cta": "string"}]
      }`,
      config: { temperature: 0, responseMimeType: "application/json" }
    });

    const data = cleanAndParseJSON(response.text || '{}');
    if (!data) throw new Error("CATEGORY_PARSE_ERROR: Failed to parse mission parameters.");

    const attributes = (data.attributes || []).map((attr: any) => ({
      ...attr,
      type: attr.type === 'NUMBER' ? AttributeType.NUMBER : (attr.type === 'BOOLEAN' ? AttributeType.BOOLEAN : AttributeType.STRING)
    }));
    
    const defaultValues: Record<string, any> = { minPrice: 0, maxPrice: null, customQuery: '' };
    attributes.forEach((a: any) => { if (a.defaultValue !== undefined) defaultValues[a.key] = a.defaultValue; });

    return { 
      attributes, 
      suggestions: data.suggestions || [], 
      marketGuide: data.marketGuide || "Tactical scouting active.", 
      defaultValues, 
      priceRange: data.priceRange || { min: 0, max: 5000, currency: region.currencySymbol }, 
      adUnits: data.adUnits || [], 
      region 
    };
  } catch (err: any) {
    console.error("Category Analysis Error:", err);
    throw new Error(err.message || "CATEGORY_ANALYSIS_FAILED");
  }
};

export const searchProducts = async (query: string, userValues: Record<string, any>, location?: UserLocation, affiliates?: any): Promise<{ products: Product[], summary: string, sources: { title: string, uri: string }[], region: RegionInfo }> => {
  const region = getRegionInfo();
  const ai = getAI();
  
  const prompt = `
    Mission: Identify top 4 specific options for: "${query}" in ${region.countryName}.
    Parameters: ${JSON.stringify(userValues)}
    Location Context: ${location?.zipCode ? `Targeting ${location.zipCode}` : 'Global/Remote'}
    
    You MUST use Google Search grounding to find REAL current pricing and merchant URLs.
    DO NOT provide placeholder URLs. If a specific merchant link is unavailable, provide the most relevant search hub link.

    Output STRICTLY as JSON:
    {
      "summary": "Brief tactical overview of current market status",
      "products": [{
        "brand": "Provider/Manufacturer", 
        "name": "Model/Package Name", 
        "price": number, 
        "currency": "${region.currencySymbol}", 
        "storeName": "Merchant Name",
        "sourceUrl": "REAL merchant URL",
        "description": "Tactical reason for inclusion", 
        "specs": {"Key Attribute": "Value"}, 
        "pros": ["Benefit"], 
        "cons": ["Trade-off"], 
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
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        temperature: 0,
        responseMimeType: "application/json"
      }
    });

    const data = cleanAndParseJSON(response.text || '');
    if (!data) throw new Error("SEARCH_PARSE_ERROR: Market intelligence data corrupted or unreadable.");
    if (!Array.isArray(data.products)) throw new Error("EMPTY_RESULT: No tactical matches found for this query.");

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
      
      let verifiedUrl = p.sourceUrl;
      if (!isRealUrl(verifiedUrl)) {
          const brandLower = (p.brand || "").toLowerCase();
          const bestMatch = groundingSources.find(src => src.title.toLowerCase().includes(brandLower));
          if (bestMatch) verifiedUrl = bestMatch.uri;
      }

      return {
          ...p,
          id: Math.random().toString(36).substr(2, 9),
          sourceUrl: isRealUrl(verifiedUrl) ? verifiedUrl : `https://www.google.com/search?q=${encodeURIComponent(p.brand + ' ' + p.name)}`,
          specs: p.specs || {},
          pros: Array.isArray(p.pros) ? p.pros : [],
          cons: Array.isArray(p.cons) ? p.cons : [],
          valueScore: p.valueScore || 75,
          valueBreakdown: { ...defaultBreakdown, ...(p.valueBreakdown || {}) },
          retailers: generateRetailerLinks({ ...p, sourceUrl: verifiedUrl }, region, affiliates)
      };
    });

    return { products, summary: data.summary || "Strike results generated.", sources: groundingSources, region };
  } catch (error: any) { 
    console.error("Search Service Failure:", error);
    throw new Error(error.message || "SEARCH_EXECUTION_FAILED"); 
  }
};
