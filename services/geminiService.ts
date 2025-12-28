
import { GoogleGenAI } from "@google/genai";
import { SpecAttribute, Product, AttributeType, PriceRange, RetailerLink, AdUnit, UserLocation, PricePoint, Briefing, MarketIntel, AdminConfig } from "../types";
import { scrubProductLinks } from "./affiliateService";

const CURRENT_DATE_CONTEXT = "Today is late 2025 (Nov/Dec), looking ahead into 2026.";

const getAdminConfig = (): AdminConfig => {
  const saved = localStorage.getItem('valuninja_admin_config');
  if (saved) return JSON.parse(saved);
  return {
    thinkingBudget: 16000,
    systemDirective: "Always prioritize absolute value and technical reliability. STATED PRICES MUST BE REAL AND GROUNDED. You are a neutral observer with NO bias toward specific retailers.",
    modelSelection: 'gemini-3-pro-preview'
  };
};

const getAffiliateConfig = () => {
  const saved = localStorage.getItem('valuninja_affiliates');
  return saved ? JSON.parse(saved) : { amazonTag: '', ebayId: '', bestBuyId: '', impactId: '' };
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

const STORES = ['Amazon', 'Best Buy', 'Walmart', 'Target', 'B&H Photo', 'eBay', 'Newegg', 'Direct Brand Site'];

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
    links.push({ name: `Direct: ${product.storeName || 'Store'}`, url: product.sourceUrl, icon: 'generic', isDirect: true });
  }

  // The AI provides the primary price point; we also provide alternative objective search links
  links.push({ name: 'Google Shopping', url: `https://www.google.com/search?q=${query}&tbm=shop`, icon: 'maps' });
  links.push({ name: 'Amazon', url: `https://www.${region.domain}/s?k=${query}`, icon: 'amazon' });
  links.push({ name: 'Best Buy', url: `https://www.${region.bestBuyDomain}/site/searchpage.jsp?st=${query}`, icon: 'bestbuy' });
  
  // POST-PROCESS: Only now do we wrap these objective links with affiliate IDs
  return scrubProductLinks(links, affiliates || getAffiliateConfig());
};

export const identifyProductFromImage = async (base64Image: string): Promise<{ name: string; analysis: string; confidence: number }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("ENVIRONMENT_AUTH_FAILURE");

  const ai = new GoogleGenAI({ apiKey });
  const config = getAdminConfig();
  const prompt = `[CONTEXT: ${CURRENT_DATE_CONTEXT}] [DIRECTIVE: ${config.systemDirective}] 
  Act as a Shinobi Vision Specialist. Analyze this product image. 
  Determine exactly what it is (Brand and Model). 
  Provide a brief tactical analysis of identifying markers.
  Return JSON: {"name": "Brand Model", "analysis": "markers", "confidence": 1-100}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    },
    config: { responseMimeType: "application/json" }
  });

  const data = cleanAndParseJSON(response.text || '{}');
  return {
    name: data.name || "Unknown Product",
    analysis: data.analysis || "Optical resolution inconclusive.",
    confidence: data.confidence || 0
  };
};

export const refreshProductPrice = async (product: Product): Promise<{ price: number, currency: string, store: string }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("ENVIRONMENT_AUTH_FAILURE");

  const ai = new GoogleGenAI({ apiKey });
  const region = getRegionInfo();
  
  const prompt = `Find the absolute lowest CURRENT price for "${product.brand} ${product.name}" in ${region.countryName}. 
  Ignore any personal bias or preferred retailers. Just find the lowest verified price.
  Output JSON: {"price": number, "currency": "string", "store": "string"}`;

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
      [CONTEXT: ${CURRENT_DATE_CONTEXT}]
      [DIRECTIVE: ${config.systemDirective}]
      Suggest buying attributes and provide expert market intelligence.
      Return JSON: {
        "attributes": [{"key": "string", "label": "string", "type": "NUMBER|STRING|BOOLEAN", "defaultValue": "any"}],
        "marketGuide": {"expertAdvice": "string", "technicalDepth": "string", "keyDifferentiators": ["string"]},
        "suggestions": ["string"],
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

    return { attributes, suggestions: data.suggestions || [], marketGuide: data.marketGuide, defaultValues, priceRange: data.priceRange || { min: 0, max: 5000, currency: region.currencySymbol }, adUnits: data.adUnits || [], region };
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
  const affiliateConfig = affiliates || getAffiliateConfig();
  
  const prompt = `Mission: Find exactly ${limit} best value products for: "${query}" in ${region.countryName}. 
  [DIRECTIVE: ${adminConfig.systemDirective}]
  STRICT INDEPENDENCE: Your goal is to find the absolute lowest prices and highest quality units. DO NOT favor large retailers over smaller verified shops if the smaller shop has a better deal.
  Output strictly JSON: {
    "summary": {"overview": "string", "deepDive": "string", "checklist": ["string"]},
    "products": [
      {
        "brand": "string", "name": "string", "price": number, "currency": "${region.currencySymbol}", 
        "storeName": "string", "sourceUrl": "DIRECT_STORE_URL", "description": "string", "specs": {}, 
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

    const groundingSources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
      .map(c => ({ title: c.web?.title || "", uri: c.web?.uri || "" }))
      .filter(s => s.uri && s.uri.startsWith('http'));

    const products = data.products.map((p: any) => ({
      ...p,
      id: Math.random().toString(36).substr(2, 9),
      // Links are objectively generated and then wrapped based on config
      retailers: generateRetailerLinks(p, region, affiliateConfig),
      priceHistory: generateSimulatedHistory(p.price, p.storeName)
    }));

    return { products, summary: data.summary, sources: groundingSources, region };
  } catch (error: any) { 
    throw new Error(error.message || "Scouting failed."); 
  }
};
