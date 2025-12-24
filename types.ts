export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
}

export type ReplenishmentModel = 'MIN_MAX' | 'PERIODIC_REVIEW' | 'FIXED_DAYS';
export type SafetyStockStrategy = 'STATISTICAL' | 'WEEKS_OF_COVER';
export type LeadTimeMode = 'AVERAGE' | 'MAX';

export interface Transaction {
  id: string;
  productId: string;
  branch?: string; 
  date: string; // ISO date string YYYY-MM-DD
  quantity: number;
  type: TransactionType;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  productId: string;
  branch?: string;
  orderDate: string; // YYYY-MM-DD
  receiveDate: string; // YYYY-MM-DD
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  branch: string;
  cost: number;
  
  leadTimeDays: number; 
  
  physicalStock?: number;  // From 'stockactual'
  availableStock?: number; // From 'stockavailable'
  stockOnOrder?: number;   // From 'stockonorder'
  currentStock: number;    // The 'effective' stock used for analysis

  currentMin?: number; 
  currentMax?: number; 

  serviceLevelOverride?: number; 
  manualAvgDailyUsage?: number; 
}

export interface ServiceLevelConfig {
  global: number;
  categories: Record<string, number>;
  stockBasis: 'physical' | 'available';
  outlierThreshold: number; // 0 for disabled, or 2, 3, 4 for sigma levels
  orderCycleDays: number;   // Days of cycle stock (Max - Min)
  replenishmentModel: ReplenishmentModel;
  
  // Advanced Robustness Settings
  safetyStockStrategy: SafetyStockStrategy;
  weeksOfSafetyStock: number; 
  leadTimeMode: LeadTimeMode;
  growthFactor: number; // 1.0 = no change, 1.1 = +10% demand forecast

  // Rebalancing Logic
  rebalancingStrategy: number; // 0 = Favor Transfer (Efficiency), 1 = Favor Ordering (Position)
  
  // Financial Assumptions
  orderPlacementCost: number; // Cost per PO (admin/shipping)
  holdingCostAnnualPct: number; // e.g., 0.20 for 20% annual holding cost
}

export interface MonthlyUsage {
  month: string; 
  quantity: number;
}

export interface AnalysisResult {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  branch: string;
  unitCost: number;
  
  calculatedStock: number; 
  onOrderQty: number; // Incoming stock
  stockBasisUsed: 'physical' | 'available';

  avgDailyUsage: number;
  stdDevUsage: number;
  monthlyTrend: MonthlyUsage[];
  isManualUsage: boolean;
  anomaliesDetectedCount: number;
  
  leadTimeUsed: number;
  isLeadTimeCalculated: boolean; 
  leadTimeModeUsed: LeadTimeMode;
  
  safetyStock: number;
  safetyStockStrategyUsed: SafetyStockStrategy;
  minStock: number; 
  maxStock: number; 
  orderCycleUsed: number;
  replenishmentModelUsed: ReplenishmentModel;

  // ABC Analysis
  abcClass: 'A' | 'B' | 'C';
  revenueContribution: number;
  eoq: number; // Economic Order Quantity

  // Suggestions
  suggestedOrderQty: number;
  suggestedTransferQty: number;
  transferSourceBranch?: string;
  
  currentMinSetting: number;
  currentMaxSetting: number;

  currentValuation: number; 
  
  currentMinValuation: number; 
  currentMaxValuation: number; 
  
  optimalMinValuation: number; 
  optimalMaxValuation: number; 
  optimalValuation: number; 
  grossOverstockValuation: number; 
  shortfallValuation: number; // Capital needed to reach optimal average
  
  stockStatus: 'LOW' | 'OK' | 'HIGH' | 'STOCKOUT' | 'INACTIVE' | 'DEAD';
  serviceLevelUsed: number;
}