
export interface RetailerLink {
  name: string;
  url: string;
  icon?: 'amazon' | 'google' | 'bestbuy' | 'generic' | 'maps';
  isDirect?: boolean;
}

export interface UserLocation {
  latitude?: number;
  longitude?: number;
  zipCode?: string;
  address?: string;
  excludeRegionSpecific?: boolean; 
  radius?: number; 
  localOnly?: boolean; 
}

export interface ValueBreakdown {
  performance: number;
  buildQuality: number;
  featureSet: number;
  reliability: number;
  userSatisfaction: number;
  efficiency: number;
  innovation: number;
  longevity: number;
  ergonomics: number;
  dealStrength: number;
}

export interface PricePoint {
  date: string;
  price: number;
  store?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  rating: number;
  description: string;
  features: string[];
  specs: Record<string, string | number>;
  pros: string[];
  cons: string[];
  imageUrl?: string;
  sourceUrl?: string;
  retailers: RetailerLink[];
  asin?: string;
  modelNumber?: string;
  isSponsored?: boolean;
  isLocal?: boolean;
  distance?: string;
  storeName?: string; 
  valueScore?: number; 
  valueBreakdown?: ValueBreakdown;
  directUrl?: string;
  lastPriceUpdate?: string;
  previousPrice?: number;
  priceHistory?: PricePoint[];
}

export enum AttributeType {
  SELECT = 'SELECT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  STRING = 'STRING'
}

export interface SpecAttribute {
  key: string;
  label: string;
  type: AttributeType;
  options?: string[];
  unit?: string;
  defaultValue?: string | number | boolean;
  description?: string;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface AdUnit {
  headline: string;
  description: string;
  cta: string;
  brand: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  username: string;
  email: string;
  rank: 'RECRUIT' | 'SHADOW' | 'ELITE' | 'SHINOBI';
  vault: Product[];
  joinedAt?: string;
}

export interface Briefing {
  overview: string;
  deepDive: string;
  checklist: string[];
}

export interface MarketIntel {
  expertAdvice: string;
  technicalDepth: string;
  keyDifferentiators: string[];
}

export interface SearchState {
  query: string;
  stage: 'IDLE' | 'ANALYZING' | 'LOADING_PRODUCTS' | 'SEARCHING' | 'RESULTS';
  attributes: SpecAttribute[];
  suggestions?: string[];
  userValues: Record<string, any>;
  priceRange?: PriceRange;
  results: Product[];
  resultsLimit: number;
  summary?: Briefing;
  marketGuide?: MarketIntel;
  adContent?: AdUnit[];
  location?: UserLocation;
  error?: string;
  scoutedImage?: string;
  identification?: {
    name: string;
    analysis: string;
    confidence: number;
  };
}

export interface NetworkUser {
  username: string;
  email: string;
  password?: string;
  vault: Product[];
  rank: UserSession['rank'];
}

export interface AdminConfig {
  thinkingBudget: number;
  systemDirective: string;
  modelSelection: 'gemini-3-pro-preview' | 'gemini-3-flash-preview';
}
