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
  radius?: number; // Search radius in km
  localOnly?: boolean; // Toggle for "Local Pickup Only"
}

export interface ValueBreakdown {
  performance: number;      // 1-10
  buildQuality: number;     // 1-10
  featureSet: number;       // 1-10
  reliability: number;      // 1-10
  userSatisfaction: number; // 1-10
  efficiency: number;       // 1-10
  innovation: number;       // 1-10
  longevity: number;        // 1-10
  ergonomics: number;       // 1-10
  dealStrength: number;     // 1-10
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
  valueScore?: number; // 1-100 total (Sum of breakdown)
  valueBreakdown?: ValueBreakdown;
  directUrl?: string; // Direct retailer/product page URL if verified
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

export interface SearchState {
  query: string;
  stage: 'IDLE' | 'ANALYZING' | 'LOADING_PRODUCTS' | 'SEARCHING' | 'RESULTS';
  attributes: SpecAttribute[];
  suggestions?: string[];
  userValues: Record<string, any>;
  priceRange?: PriceRange;
  results: Product[];
  marketGuide?: string;
  adContent?: AdUnit[];
  location?: UserLocation;
  error?: string;
}