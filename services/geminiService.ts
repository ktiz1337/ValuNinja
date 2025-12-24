
import { GoogleGenAI } from "@google/genai";
import { SpecAttribute, Product, AttributeType, PriceRange, RetailerLink, AdUnit, UserLocation } from "../types";

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
    if (affiliates?.impactId && !finalUrl.includes('amazon')) finalUrl += (finalUrl.includes('?') ? '&' : '?') + `irclickid=${affiliates.impactId}`;
    links.push({ name: `Strike: ${product.storeName || 'Verified Merchant'}`, url: finalUrl, icon: 'generic', isDirect: true });
  }
  links.push({ name: 'Market Discovery Hub', url: `https://www.google.com/search?q=${query}&tbm=shop`, icon: 'maps' });
  let amzUrl = `https://www.${region.domain}/s?k=${query}`;
  if (affiliates?.amazonTag) amzUrl += `&tag=${affiliates.amazonTag}`;
  links.push({ name: 'Amazon Quick Scan', url: amzUrl, icon: 'amazon' });
  return links;
};

export const analyzeProductCategory = async (query: string): Promise<{ attributes: SpecAttribute[], suggestions: string[], marketGuide: string, defaultValues: Record<string, any>, priceRange: PriceRange, adUnits: AdUnit[], region: RegionInfo }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const region = getRegionInfo();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: `Mission: Analyze "${query}" in ${region.countryName}. Define 4 key technical attributes to compare for this product/service. Return strictly JSON: {"attributes": [{"key": "string", "label": "string", "type": "NUMBER|STRING|BOOLEAN", "defaultValue": "any"}],"marketGuide": "2-3 sentences of tactical advice","suggestions": ["specific spec 1", "specific spec 2"],"priceRange": {"min": number, "max": number, "currency": "string"},"adUnits": [{"brand": "string", "headline": "string", "description": "string", "cta": "string"}]}`,
      config: { temperature: 0, responseMimeType: "application/json" }
    });

    const data = cleanAndParseJSON(response.text || '{}');
    if (!data) throw new Error("CATEGORY_PARSE_ERROR");

    const attributes = (data.attributes || []).map((attr: any) => ({
      ...attr,
      type: attr.type === 'NUMBER' ? AttributeType.NUMBER : (attr.type === 'BOOLEAN' ? AttributeType.BOOLEAN : AttributeType.STRING)
    }));
    
    const defaultValues: Record<string, any> = { minPrice: 0, maxPrice: null, customQuery: '' };
    attributes.forEach((a: any) => { if (a.defaultValue !== undefined) defaultValues[a.key] = a.defaultValue; });

    return { attributes, suggestions: data.suggestions || [], marketGuide: data.marketGuide || "Tactical scouting active.", defaultValues, priceRange: data.priceRange || { min: 0, max: 5000, currency: region.currencySymbol }, adUnits: data.adUnits || [], region };
  } catch (err: any) {
    throw new Error(err.message || "CATEGORY_ANALYSIS_FAILED");
  }
};

export const searchProducts = async (query: string, userValues: Record<string, any>, location?: UserLocation, affiliates?: any): Promise<{ products: Product[], summary: string, sources: { title: string, uri: string }[], region: RegionInfo }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const region = getRegionInfo();
  
  const prompt = `Mission: Identify top 4 specific options for: "${query}" in ${region.countryName}. Parameters: ${JSON.stringify(userValues)}. Location Context: ${location?.zipCode ? `Targeting ${location.zipCode}` : 'Global/Remote'}. You MUST use Google Search grounding to find REAL current pricing and merchant URLs. Output STRICTLY as JSON: {"summary": "Tactical overview", "products": [{"brand": "Provider", "name": "Model", "price": number, "currency": "${region.currencySymbol}", "storeName": "Merchant", "sourceUrl": "REAL URL", "description": "Reason", "specs": {"Key": "Value"}, "pros": ["Benefit"], "cons": ["Trade-off"], "valueScore": 1-100, "valueBreakdown": {"performance": 1-10, "buildQuality": 1-10, "featureSet": 1-10, "reliability": 1-10, "userSatisfaction": 1-10, "efficiency": 1-10, "innovation": 1-10, "longevity": 1-10, "ergonomics": 1-10, "dealStrength": 1-10}}]}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', 
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        temperature: 0,
        responseMimeType: "application/json"
      }
    });

    const data = cleanAndParseJSON(response.text || '');
    if (!data) throw new Error("SEARCH_PARSE_ERROR");
    if (!Array.isArray(data.products)) throw new Error("EMPTY_RESULT");

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = chunks.map(c => {
      const uri = c.web?.uri || c.maps?.uri;
      const title = c.web?.title || c.maps?.title || "";
      if (uri && isRealUrl(uri)) return { title, uri };
      return null;
    }).filter((s): s is { title: string, uri: string } => !!s);

    const products = data.products.map((p: any) => {
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
          valueBreakdown: { performance: 7, buildQuality: 7, featureSet: 7, reliability: 7, userSatisfaction: 7, efficiency: 7, innovation: 7, longevity: 7, ergonomics: 7, dealStrength: 7, ...(p.valueBreakdown || {}) },
          retailers: generateRetailerLinks({ ...p, sourceUrl: verifiedUrl }, region, affiliates)
      };
    });

    return { products, summary: data.summary || "Strike results generated.", sources: groundingSources, region };
  } catch (error: any) { 
    throw new Error(error.message || "SEARCH_EXECUTION_FAILED"); 
  }
};
