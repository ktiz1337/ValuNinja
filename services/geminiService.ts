
import { GoogleGenAI } from "@google/genai";
import { SpecAttribute, Product, AttributeType, PriceRange, RetailerLink, AdUnit, UserLocation, PricePoint, Briefing, MarketIntel, AdminConfig } from "../types";

// Current temporal context to ensure the AI doesn't rely on outdated data
const CURRENT_DATE_CONTEXT = "Today is late 2025 (Nov/Dec), looking ahead into 2026.";

const getAdminConfig = (): AdminConfig => {
  const saved = localStorage.getItem('valuninja_admin_config');
  if (saved) return JSON.parse(saved);
  return {
    thinkingBudget: 16000,
    systemDirective: "Always prioritize absolute value and technical reliability.",
    modelSelection: 'gemini-3-pro-preview'
  };
};

const cleanAndParseJSON = (text: string) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let target = text;
      if (jsonMatch) {
        target = jsonMatch[1];
      } else {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        const start = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
        const end = (lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket)) ? lastBrace : lastBracket;
        if (start !== -1 && end !== -1) target = text.substring(start, end + 1);
      }
      const cleaned = target.replace(/,\s*([\]}])/g, '$1').replace(/(\r\n|\n|\r)/gm, " ");
      return JSON.parse(cleaned);
    } catch (innerError) {
      return null;
    }
  }
};

const STORES = ['Amazon', 'Best Buy', 'Walmart', 'Target', 'B&H Photo', 'eBay', 'Newegg'];

const generateSimulatedHistory = (currentPrice: number, currentStore?: string): PricePoint[] => {
  const history: PricePoint[] = [];
  const now = new Date();
  for (let i = 10; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - (i * 3));
    const variance = 0.85 + (Math.random() * 0.2);
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(currentPrice * variance),
      store: STORES[Math.floor(Math.random() * STORES.length)]
    });
  }
  history.push({
    date: now.toISOString().split('T')[0],
    price: currentPrice,
    store: currentStore || STORES[0]
  });
  return history;
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
    links.push({ name: `Direct: ${product.storeName || 'Verified Store'}`, url: finalUrl, icon: 'generic', isDirect: true });
  }

  links.push({ name: 'Google Shopping', url: `https://www.google.com/search?q=${query}&tbm=shop`, icon: 'maps' });
  
  let amzUrl = `https://www.${region.domain}/s?k=${query}`;
  if (affiliates?.amazonTag) amzUrl += `&tag=${affiliates.amazonTag}`;
  links.push({ name: 'Amazon Store', url: amzUrl, icon: 'amazon' });
  
  return links;
};

export const identifyProductFromImage = async (base64Image: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("ENVIRONMENT_AUTH_FAILURE");

  const ai = new GoogleGenAI({ apiKey });
  const config = getAdminConfig();
  const prompt = `[CONTEXT: ${CURRENT_DATE_CONTEXT}] [DIRECTIVE: ${config.systemDirective}] Identify this product exactly. Return ONLY the Brand and Model name. If you cannot identify it, return 'Unknown Product'.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    }
  });

  return response.text?.trim() || "Unknown Product";
};

export const refreshProductPrice = async (product: Product): Promise<{ price: number, currency: string, store: string }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("ENVIRONMENT_AUTH_FAILURE");

  const ai = new GoogleGenAI({ apiKey });
  const region = getRegionInfo();
  
  const prompt = `Deep Recon Mission [CONTEXT: ${CURRENT_DATE_CONTEXT}]: Find the CURRENT best price for the product: "${product.brand} ${product.name}" in ${region.countryName}. 
  Use Search Grounding for REAL pricing from Google Shopping, Amazon, or local stores for late 2025/2026.
  Output JSON strictly: {"price": number, "currency": "string", "store": "string"}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      tools: [{ googleSearch: {} }],
      temperature: 0,
      responseMimeType: "application/json"
    }
  });

  const data = cleanAndParseJSON(response.text || '{}');
  return { 
    price: data.price || product.price, 
    currency: data.currency || product.currency, 
    store: data.store || product.storeName || 'Online' 
  };
};

export const analyzeProductCategory = async (query: string): Promise<{ attributes: SpecAttribute[], suggestions: string[], marketGuide: MarketIntel, defaultValues: Record<string, any>, priceRange: PriceRange, adUnits: AdUnit[], region: RegionInfo }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("ENVIRONMENT_AUTH_FAILURE");
  
  const ai = new GoogleGenAI({ apiKey });
  const region = getRegionInfo();
  const config = getAdminConfig();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Mission: Analyze "${query}" for ${region.countryName}. 
      [CONTEXT: ${CURRENT_DATE_CONTEXT} Ensure analysis is strictly based on current 2025/2026 data. DO NOT halluncinate older model information.]
      [DIRECTIVE: ${config.systemDirective}]
      If this is a GIFT or TRIP request, suggest attributes like 'Age Group', 'Interests', 'Seasonality', 'Recipient Type', etc.
      Return JSON strictly: {
        "attributes": [{"key": "string", "label": "string", "type": "NUMBER|STRING|BOOLEAN", "defaultValue": "any"}],
        "marketGuide": {
          "expertAdvice": "A detailed paragraph of expert buying/planning advice for this specific category.",
          "technicalDepth": "A second paragraph going deep into technical specs or current market trends.",
          "keyDifferentiators": ["Point 1", "Point 2", "Point 3"]
        },
        "suggestions": ["feature 1", "feature 2"],
        "priceRange": {"min": number, "max": number, "currency": "string"},
        "adUnits": [{"brand": "string", "headline": "string", "description": "string", "cta": "string"}]
      }`,
      config: { temperature: 0, responseMimeType: "application/json" }
    });

    const data = cleanAndParseJSON(response.text || '{}');
    if (!data) throw new Error("Scout telemetry failed.");

    const attributes = (data.attributes || []).map((attr: any) => ({
      ...attr,
      type: attr.type === 'NUMBER' ? AttributeType.NUMBER : (attr.type === 'BOOLEAN' ? AttributeType.BOOLEAN : AttributeType.STRING)
    }));
    
    const defaultValues: Record<string, any> = { minPrice: 0, maxPrice: null, customQuery: '' };
    attributes.forEach((a: any) => { if (a.defaultValue !== undefined) defaultValues[a.key] = a.defaultValue; });

    const marketGuide: MarketIntel = data.marketGuide || {
      expertAdvice: "Analyzing category trends...",
      technicalDepth: "Reviewing current market specifications...",
      keyDifferentiators: ["Performance Standards", "Value Metrics"]
    };

    return { attributes, suggestions: data.suggestions || [], marketGuide, defaultValues, priceRange: data.priceRange || { min: 0, max: 5000, currency: region.currencySymbol }, adUnits: data.adUnits || [], region };
  } catch (err: any) {
    throw new Error(err.message || "Failed to analyze category");
  }
};

export const searchProducts = async (
  query: string, 
  userValues: Record<string, any>, 
  location?: UserLocation, 
  affiliates?: any,
  limit: number = 4
): Promise<{ products: Product[], summary: Briefing, sources: { title: string, uri: string }[], region: RegionInfo }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("ENVIRONMENT_AUTH_FAILURE");

  const ai = new GoogleGenAI({ apiKey });
  const region = getRegionInfo();
  const adminConfig = getAdminConfig();
  
  const prompt = `Mission: Find EXACTLY ${limit} best value products or options for: "${query}" in ${region.countryName}. 
  [CONTEXT: ${CURRENT_DATE_CONTEXT} Use search grounding to ensure models, availability, and pricing are strictly current for 2025/2026. DO NOT hallucinate older data.]
  [DIRECTIVE: ${adminConfig.systemDirective}]
  If this is a GIFT search, prioritize highly-rated, trending items from late 2025.
  Requirements: ${JSON.stringify(userValues)}. 
  Use Search Grounding for REAL pricing. 
  Output strictly JSON: {
    "summary": {
       "overview": "A detailed strategic overview of why these products were selected...",
       "deepDive": "A second detailed paragraph focusing on technical nuances and current market context...",
       "checklist": ["Essential feature 1", "Expert tip 2", "Value factor 3"]
    },
    "products": [
      {
        "brand": "Brand", "name": "Model", "price": number, "currency": "${region.currencySymbol}", 
        "storeName": "Merchant", "sourceUrl": "URL", "description": "Analysis", "specs": {"Key": "Value"}, 
        "pros": [], "cons": [], "valueScore": 1-100, 
        "valueBreakdown": {"performance": 1-10, "buildQuality": 1-10, "featureSet": 1-10, "reliability": 1-10, "userSatisfaction": 1-10, "efficiency": 1-10, "innovation": 1-10, "longevity": 1-10, "ergonomics": 1-10, "dealStrength": 1-10}
      }
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: adminConfig.modelSelection, 
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        temperature: 0,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: adminConfig.thinkingBudget }
      }
    });

    const data = cleanAndParseJSON(response.text || '');
    if (!data || !Array.isArray(data.products)) throw new Error("No results found.");

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = chunks.map(c => ({ title: c.web?.title || "", uri: c.web?.uri || "" })).filter(s => isRealUrl(s.uri));

    const products = data.products.map((p: any) => ({
      ...p,
      id: Math.random().toString(36).substr(2, 9),
      retailers: generateRetailerLinks(p, region, affiliates),
      priceHistory: generateSimulatedHistory(p.price, p.storeName)
    }));

    const summaryObj: Briefing = data.summary || {
      overview: "Strike results generated.",
      deepDive: "Analyzing market nuances for technical efficiency.",
      checklist: ["Verify seller rating", "Check warranty terms"]
    };

    return { products, summary: summaryObj, sources: groundingSources, region };
  } catch (error: any) { 
    throw new Error(error.message || "Scouting failed."); 
  }
};
