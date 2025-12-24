import { AnalysisResult, Product, ServiceLevelConfig, Transaction, TransactionType, PurchaseOrder, MonthlyUsage } from "./types";

// Helper for Z-score (Standard Normal Distribution)
function getZScore(p: number): number {
  if (p >= 1) return 3.5;
  if (p <= 0) return -3.5;
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;
  const q = p < 0.5 ? p : 1 - p;
  const t = Math.sqrt(-2 * Math.log(q));
  const num = c0 + c1 * t + c2 * t * t;
  const den = 1 + d1 * t + d2 * t * t + d3 * t * t * t;
  let z = t - num / den;
  if (p < 0.5) z = -z;
  return z;
}

const parseDateFlexible = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  const cleaned = dateStr.replace(/\//g, '-');
  const d2 = new Date(cleaned);
  if (!isNaN(d2.getTime())) return d2.toISOString().split('T')[0];
  return "";
};

const normalizeId = (id: any): string => String(id || "").trim().toLowerCase();

const MAPPINGS = {
  productId: ['productid', 'productcode', 'sku', 'item', 'itemno', 'partnumber', 'part', 'code', 'id', 'itemnumber'],
  description: ['description', 'name', 'itemname', 'productname', 'desc', 'itemdescription', 'productdescription'],
  branch: ['branch', 'location', 'whse', 'warehouse', 'site', 'store', 'br'],
  category: ['category', 'group', 'pg', 'class', 'type', 'prodgroup'],
  cost: ['averagecostwithadd', 'cost', 'avgcost', 'price', 'unitcost', 'value', 'avgprice', 'ucost'],
  leadTime: ['leadtime', 'lead', 'days', 'lt', 'ltday', 'leaddays'],
  physicalStock: ['stockactual', 'quantity', 'onhand', 'physical', 'actual', 'stock', 'qty', 'stockonhand', 'qoh'],
  availableStock: ['stockavailable', 'available', 'avail', 'free', 'stkavail'],
  stockOnOrder: ['stockonorder', 'onorder', 'incoming', 'committed', 'qtyonorder', 'onorderqty'],
  date: ['stocktransactiondate', 'date', 'datetime', 'time', 'created', 'transactiondate', 'datetimecreated', 'orderdate', 'posteddate'],
  qtyReceived: ['quantity', 'qty', 'quantityreceived', 'qtyreceived', 'received', 'qtyordered', 'orderqty'],
  poNumber: ['purchaseordernumber', 'ponumber', 'po', 'order', 'orderno', 'poid'],
  min: ['stocklevelmin', 'min', 'minstock', 'rop', 'reorderpoint'],
  max: ['stocklevelmax', 'max', 'maxstock', 'out', 'orderupto']
};

const normalizeHeader = (h: string): string => 
  h.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/^["']|["']$/g, '').replace(/[^a-z0-9]/g, '');

const findMappedValue = (row: any, keys: string[]) => {
  const rowKeys = Object.keys(row);
  for (const key of keys) {
    const normSearchKey = normalizeHeader(key);
    for (const rk of rowKeys) {
      if (normalizeHeader(rk) === normSearchKey) {
        const val = row[rk];
        if (val !== undefined && val !== null && String(val).trim() !== "") return val;
      }
    }
  }
  return undefined;
};

const detectDelimiter = (line: string): string => {
  const delimiters = [',', ';', '\t', '|'];
  const counts = delimiters.map(d => ({ d, count: line.split(d).length }));
  return delimiters[counts.indexOf(counts.sort((a, b) => b.count - a.count)[0])];
};

const splitCSVLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let curVal = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { curVal += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === delimiter && !inQuotes) {
      result.push(curVal.trim());
      curVal = '';
    } else { curVal += char; }
  }
  result.push(curVal.trim());
  return result.map(v => v.replace(/^"|"$/g, '').trim());
};

export const PRODUCT_TEMPLATE = `productid,description,productcode,PG,Branch,AverageCostWithAdd,LeadTime,StockLevelMin,StockLevelMax,stockactual,stockavailable,stockonorder`;
export const TRANSACTION_TEMPLATE = `ProductID,branch,StockTransactionDate,StockActual\n154,Leduc,2025-01-01,-10`;
export const PO_TEMPLATE = `purchaseordernumber,ProductID,name,DateTimeCreated,DateReceived,Quantity\n47079,154,Leduc,2025-01-01,,4`;

export const downloadCSV = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const detectCSVType = (csv: string): 'products' | 'transactions' | 'pos' | 'unknown' => {
  const lines = csv.split(/\r\n|\n|\r/).filter(l => l.trim() !== '');
  if (lines.length === 0) return 'unknown';
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes('purchaseordernumber') || firstLine.includes('quantityreceived') || firstLine.includes('receivedate') || firstLine.includes('ponumber')) return 'pos';
  if (firstLine.includes('transactiondate') || firstLine.includes('stocktransactiondate')) return 'transactions';
  if (firstLine.includes('stockactual') || firstLine.includes('stockavailable') || firstLine.includes('averagecostwithadd') || firstLine.includes('productid')) return 'products';
  return 'unknown';
};

const parseCSVRaw = (csv: string) => {
  const lines = csv.split(/\r\n|\n|\r/).filter(l => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };
  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCSVLine(lines[0], delimiter);
  const rows = lines.slice(1).map(line => {
    const parts = splitCSVLine(line, delimiter);
    const row: any = {};
    headers.forEach((h, idx) => { row[h] = parts[idx]; });
    return row;
  });
  return { headers, rows };
};

export const parseProductsFromCSV = (csv: string) => {
  const { headers, rows } = parseCSVRaw(csv);
  const data: Product[] = rows.map((row): Product | null => {
    const id = findMappedValue(row, MAPPINGS.productId);
    if (!id) return null;
    return {
      id: normalizeId(id),
      name: findMappedValue(row, MAPPINGS.description) || id,
      sku: findMappedValue(row, MAPPINGS.productId) || id,
      category: (findMappedValue(row, MAPPINGS.category) || 'General').trim(),
      branch: (findMappedValue(row, MAPPINGS.branch) || 'Main').trim(),
      cost: parseFloat(String(findMappedValue(row, MAPPINGS.cost) || 0).replace(/[^0-9.]/g, '')) || 0,
      leadTimeDays: parseFloat(String(findMappedValue(row, MAPPINGS.leadTime) || 7)) || 7,
      currentStock: parseFloat(String(findMappedValue(row, MAPPINGS.physicalStock) || 0)) || 0,
      physicalStock: parseFloat(String(findMappedValue(row, MAPPINGS.physicalStock) || 0)) || 0,
      availableStock: parseFloat(String(findMappedValue(row, MAPPINGS.availableStock) || 0)) || 0,
      stockOnOrder: parseFloat(String(findMappedValue(row, MAPPINGS.stockOnOrder) || 0)) || 0,
      currentMin: parseFloat(String(findMappedValue(row, MAPPINGS.min) || 0)) || 0,
      currentMax: parseFloat(String(findMappedValue(row, MAPPINGS.max) || 0)) || 0,
    };
  }).filter((p): p is Product => p !== null);
  return { data, errors: [], headers };
};

export const parseTransactionsFromCSV = (csv: string) => {
  const { headers, rows } = parseCSVRaw(csv);
  const data: Transaction[] = rows.map((row): Transaction | null => {
    const id = findMappedValue(row, MAPPINGS.productId);
    if (!id) return null;
    const qty = parseFloat(String(findMappedValue(row, MAPPINGS.physicalStock) || 0));
    return {
      id: Math.random().toString(36).substr(2, 9),
      productId: normalizeId(id),
      branch: findMappedValue(row, MAPPINGS.branch) || 'Main',
      date: parseDateFlexible(findMappedValue(row, MAPPINGS.date) || ""),
      quantity: Math.abs(qty),
      type: qty < 0 ? TransactionType.OUT : TransactionType.IN
    };
  }).filter((t): t is Transaction => t !== null);
  return { data, errors: [], headers };
};

export const parsePOsFromCSV = (csv: string) => {
  const { headers, rows } = parseCSVRaw(csv);
  const data: PurchaseOrder[] = rows.map((row): PurchaseOrder | null => {
    const id = findMappedValue(row, MAPPINGS.productId);
    if (!id) return null;
    return {
      id: Math.random().toString(36).substr(2, 9),
      poNumber: String(findMappedValue(row, MAPPINGS.poNumber) || 'PO'),
      productId: normalizeId(id),
      branch: findMappedValue(row, MAPPINGS.branch) || 'Main',
      orderDate: parseDateFlexible(findMappedValue(row, MAPPINGS.date) || ""),
      receiveDate: parseDateFlexible(row.datereceived || row.receivedate || ""),
      quantity: parseFloat(String(findMappedValue(row, MAPPINGS.qtyReceived) || 0)) || 0,
    };
  }).filter((po): po is PurchaseOrder => po !== null);
  return { data, errors: [], headers };
};

export const generateMockData = () => {
  const products: Product[] = [
    // Store: Springfield Central
    { id: 'GR-001', name: 'Organic Honeycrisp Apples', sku: 'APPLE-HC-ORG', category: 'Produce', branch: 'Springfield Central', cost: 1.45, leadTimeDays: 2, currentStock: 45, physicalStock: 45, availableStock: 40, stockOnOrder: 100, currentMin: 50, currentMax: 300 },
    { id: 'GR-002', name: 'Whole Milk (1 Gallon)', sku: 'MILK-W-GAL', category: 'Dairy & Eggs', branch: 'Springfield Central', cost: 3.20, leadTimeDays: 1, currentStock: 120, physicalStock: 120, availableStock: 115, stockOnOrder: 0, currentMin: 80, currentMax: 200 },
    { id: 'GR-003', name: 'Grass-Fed Ribeye Steak', sku: 'BEEF-RB-GF', category: 'Meat & Seafood', branch: 'Springfield Central', cost: 18.50, leadTimeDays: 3, currentStock: 12, physicalStock: 12, availableStock: 12, stockOnOrder: 24, currentMin: 20, currentMax: 50 },
    
    // Store: Westside Heights
    { id: 'GR-001', name: 'Organic Honeycrisp Apples', sku: 'APPLE-HC-ORG', category: 'Produce', branch: 'Westside Heights', cost: 1.45, leadTimeDays: 2, currentStock: 410, physicalStock: 410, availableStock: 410, stockOnOrder: 0, currentMin: 60, currentMax: 350 },
    { id: 'GR-004', name: 'Artisan Sourdough Loaf', sku: 'BREAD-SD-ART', category: 'Bakery', branch: 'Westside Heights', cost: 4.10, leadTimeDays: 1, currentStock: 8, physicalStock: 8, availableStock: 8, stockOnOrder: 30, currentMin: 15, currentMax: 40 },
    { id: 'GR-005', name: 'Extra Virgin Olive Oil (500ml)', sku: 'OIL-EVOO-500', category: 'Pantry', branch: 'Westside Heights', cost: 12.00, leadTimeDays: 7, currentStock: 85, physicalStock: 85, availableStock: 85, stockOnOrder: 0, currentMin: 20, currentMax: 100 },

    // Store: Capital City Hub
    { id: 'GR-006', name: 'Avocados (Hass Large)', sku: 'AVO-HASS-LG', category: 'Produce', branch: 'Capital City Hub', cost: 0.85, leadTimeDays: 2, currentStock: 300, physicalStock: 300, availableStock: 290, stockOnOrder: 500, currentMin: 400, currentMax: 1200 },
    { id: 'GR-002', name: 'Whole Milk (1 Gallon)', sku: 'MILK-W-GAL', category: 'Dairy & Eggs', branch: 'Capital City Hub', cost: 3.20, leadTimeDays: 1, currentStock: 45, physicalStock: 45, availableStock: 45, stockOnOrder: 200, currentMin: 150, currentMax: 400 },
    { id: 'GR-007', name: 'Sparkling Water (12pk)', sku: 'BEV-SW-12PK', category: 'Beverages', branch: 'Capital City Hub', cost: 5.50, leadTimeDays: 5, currentStock: 24, physicalStock: 24, availableStock: 24, stockOnOrder: 0, currentMin: 100, currentMax: 500 }
  ];

  // Generate some high-frequency transactions for grocery items
  const transactions: Transaction[] = [];
  const now = new Date();
  
  products.forEach(p => {
    // Each product gets ~30 days of sales history
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Random daily sales volume based on product type
      let baseQty = p.category === 'Produce' || p.category === 'Dairy & Eggs' ? 15 : 5;
      const salesQty = Math.floor(Math.random() * baseQty) + 2;

      transactions.push({
        id: `tx-${p.sku}-${i}`,
        productId: p.id,
        branch: p.branch,
        date: date.toISOString().split('T')[0],
        quantity: salesQty,
        type: TransactionType.OUT
      });
    }
  });

  return { products, transactions, purchaseOrders: [] };
};

export const calculateInventoryMetrics = (
  products: Product[],
  transactions: Transaction[],
  purchaseOrders: PurchaseOrder[],
  slConfig: ServiceLevelConfig
): AnalysisResult[] => {
  if (!products.length) return [];

  let globalMaxTime = -Infinity;
  transactions.forEach(t => {
    const time = new Date(t.date).getTime();
    if (!isNaN(time) && time > globalMaxTime) globalMaxTime = time;
  });
  if (globalMaxTime === -Infinity) globalMaxTime = new Date().getTime();

  // PASS 1: Calculate core metrics for each item
  const results = products.map((product) => {
    let serviceLevel = slConfig.global;
    if (product.serviceLevelOverride) {
      serviceLevel = product.serviceLevelOverride;
    } else if (slConfig.categories[product.category]) {
      serviceLevel = slConfig.categories[product.category];
    }

    let effectiveStock = product.currentStock;
    if (slConfig.stockBasis === 'physical' && product.physicalStock !== undefined) {
      effectiveStock = product.physicalStock;
    } else if (slConfig.stockBasis === 'available' && product.availableStock !== undefined) {
      effectiveStock = product.availableStock;
    }
    
    const prodIdNorm = normalizeId(product.id);
    const prodBranchNorm = normalizeId(product.branch || 'Main');

    const branchTrans = transactions.filter(t => 
      normalizeId(t.productId) === prodIdNorm && 
      normalizeId(t.branch || 'Main') === prodBranchNorm
    );
    const productPOs = purchaseOrders.filter(po => 
      normalizeId(po.productId) === prodIdNorm && 
      normalizeId(po.branch || 'Main') === prodBranchNorm
    );

    const onOrderQty = product.stockOnOrder || 0;

    let leadTimeDays = isNaN(product.leadTimeDays) ? 7 : Math.max(1, product.leadTimeDays);
    let isLeadTimeCalculated = false;

    if (productPOs.length > 0) {
      const recordedTimes: number[] = [];
      productPOs.forEach(po => {
        if (po.receiveDate && po.orderDate) {
           const start = new Date(po.orderDate).getTime();
           const end = new Date(po.receiveDate).getTime();
           if (!isNaN(start) && !isNaN(end)) {
              const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
              if (diffDays >= 0 && diffDays < 365) recordedTimes.push(diffDays);
           }
        }
      });
      if (recordedTimes.length > 0) {
        leadTimeDays = slConfig.leadTimeMode === 'MAX' ? Math.max(...recordedTimes) : recordedTimes.reduce((a, b) => a + b, 0) / recordedTimes.length;
        leadTimeDays = Math.max(1, leadTimeDays);
        isLeadTimeCalculated = true;
      }
    }

    let avgDailyUsage = 0;
    let stdDevUsage = 0;
    let anomaliesDetectedCount = 0;
    let monthlyTrend: MonthlyUsage[] = [];
    const usageTrans = branchTrans.filter(t => t.type === TransactionType.OUT);
    
    if (product.manualAvgDailyUsage !== undefined && product.manualAvgDailyUsage > 0) {
      avgDailyUsage = product.manualAvgDailyUsage;
      stdDevUsage = avgDailyUsage * 0.3; 
    } else if (branchTrans.length > 0) {
      let firstActivityTime = Infinity;
      branchTrans.forEach(t => {
        const time = new Date(t.date).getTime();
        if (!isNaN(time) && time < firstActivityTime) firstActivityTime = time;
      });

      const dayInMillis = 1000 * 60 * 60 * 24;
      const activeDaysSpan = Math.max(1, Math.ceil((globalMaxTime - firstActivityTime) / dayInMillis) + 1);

      const dailyUsage: Record<string, number> = {};
      usageTrans.forEach((t) => {
        if (!t.date) return;
        dailyUsage[t.date] = (dailyUsage[t.date] || 0) + t.quantity;
      });

      const dailyPoints: number[] = [];
      let totalUsage = 0;
      for (let i = 0; i < activeDaysSpan; i++) {
          const d = new Date(firstActivityTime + (i * dayInMillis)).toISOString().split('T')[0];
          const q = dailyUsage[d] || 0;
          totalUsage += q;
          dailyPoints.push(q);
      }

      let rawAvg = totalUsage / activeDaysSpan;
      let rawStdDev = Math.sqrt(dailyPoints.reduce((acc, q) => acc + Math.pow(q - rawAvg, 2), 0) / activeDaysSpan);
      
      let cleanPoints = dailyPoints;
      if (slConfig.outlierThreshold > 0 && rawStdDev > 0) {
          const maxAllowed = rawAvg + (slConfig.outlierThreshold * rawStdDev);
          cleanPoints = dailyPoints.filter(q => { if (q > maxAllowed) { anomaliesDetectedCount++; return false; } return true; });
      }

      avgDailyUsage = (cleanPoints.reduce((acc, q) => acc + q, 0) / (cleanPoints.length || 1)) * slConfig.growthFactor;
      stdDevUsage = Math.sqrt(cleanPoints.reduce((acc, q) => acc + Math.pow(q - (avgDailyUsage/slConfig.growthFactor), 2), 0) / (cleanPoints.length || 1));

      const monthlyUsageMap: Record<string, number> = {};
      usageTrans.forEach(t => {
        if (t.date && t.date.length >= 7) {
          const month = t.date.substring(0, 7);
          monthlyUsageMap[month] = (monthlyUsageMap[month] || 0) + t.quantity;
        }
      });
      monthlyTrend = Object.entries(monthlyUsageMap).map(([month, quantity]) => ({ month, quantity })).sort((a,b) => a.month.localeCompare(b.month));
    }

    const z = getZScore(serviceLevel);
    let safetyStock = 0;
    if (slConfig.safetyStockStrategy === 'STATISTICAL') {
      safetyStock = Math.ceil(z * stdDevUsage * Math.sqrt(leadTimeDays));
    } else {
      safetyStock = Math.ceil(avgDailyUsage * 7 * slConfig.weeksOfSafetyStock);
    }

    let minStock = Math.ceil(avgDailyUsage * leadTimeDays + safetyStock);
    let maxStock = minStock + Math.ceil(avgDailyUsage * slConfig.orderCycleDays);

    let stockStatus: 'LOW' | 'OK' | 'HIGH' | 'STOCKOUT' | 'INACTIVE' | 'DEAD' = 'OK';
    if (usageTrans.length === 0 && effectiveStock > 0) {
      stockStatus = 'DEAD';
    } else if (effectiveStock <= 0) {
      stockStatus = avgDailyUsage > 0.01 ? 'STOCKOUT' : 'INACTIVE';
    } else if (effectiveStock < minStock) {
      stockStatus = 'LOW';
    } else if (effectiveStock > maxStock) {
      stockStatus = 'HIGH';
    } else if (avgDailyUsage === 0 && effectiveStock > 0) {
      stockStatus = 'DEAD';
    }

    const suggestedOrderQty = (stockStatus === 'LOW' || stockStatus === 'STOCKOUT') ? Math.max(0, maxStock - effectiveStock - onOrderQty) : 0;
    
    // Pass 1 calculations
    const currentValuation = effectiveStock * product.cost;
    const optimalValuation = ((minStock + maxStock) / 2) * product.cost;
    const revenueContribution = avgDailyUsage * product.cost * 365;

    // EOQ Implementation: sqrt((2 * annual_demand * order_cost) / holding_cost_per_unit)
    const annualDemand = avgDailyUsage * 365;
    const holdingCostPerUnit = product.cost * (slConfig.holdingCostAnnualPct || 0.20);
    const eoq = Math.ceil(Math.sqrt((2 * annualDemand * (slConfig.orderPlacementCost || 50)) / (holdingCostPerUnit || 1)));

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      branch: product.branch,
      unitCost: product.cost,
      calculatedStock: effectiveStock,
      onOrderQty,
      stockBasisUsed: slConfig.stockBasis,
      avgDailyUsage,
      stdDevUsage,
      monthlyTrend,
      isManualUsage: product.manualAvgDailyUsage !== undefined,
      anomaliesDetectedCount,
      leadTimeUsed: leadTimeDays,
      isLeadTimeCalculated,
      leadTimeModeUsed: slConfig.leadTimeMode,
      safetyStock,
      safetyStockStrategyUsed: slConfig.safetyStockStrategy,
      minStock,
      maxStock,
      orderCycleUsed: slConfig.orderCycleDays,
      replenishmentModelUsed: slConfig.replenishmentModel,
      suggestedOrderQty,
      suggestedTransferQty: 0,
      currentMinSetting: product.currentMin || 0,
      currentMaxSetting: product.currentMax || 0,
      currentValuation,
      currentMinValuation: minStock * product.cost,
      currentMaxValuation: maxStock * product.cost,
      optimalMinValuation: minStock * product.cost,
      optimalMaxValuation: maxStock * product.cost,
      optimalValuation,
      revenueContribution,
      eoq,
      grossOverstockValuation: stockStatus === 'DEAD' ? currentValuation : Math.max(0, currentValuation - (maxStock * product.cost)),
      shortfallValuation: Math.max(0, optimalValuation - (currentValuation + (onOrderQty * product.cost))),
      stockStatus,
      serviceLevelUsed: serviceLevel
    } as AnalysisResult;
  });

  // PASS 2: Multi-Pass for ABC and Inter-branch Transfers
  const sortedByRevenue = [...results].sort((a, b) => b.revenueContribution - a.revenueContribution);
  const totalRev = sortedByRevenue.reduce((acc, curr) => acc + curr.revenueContribution, 0);
  
  let cumulativeRev = 0;
  const finalResults = sortedByRevenue.map((item) => {
    cumulativeRev += item.revenueContribution;
    const percent = totalRev > 0 ? (cumulativeRev / totalRev) : 0;
    
    let abcClass: 'A' | 'B' | 'C' = 'C';
    if (percent <= 0.80) abcClass = 'A';
    else if (percent <= 0.95) abcClass = 'B';
    
    // Inter-branch Transfer Logic
    // Find branches with excess stock for this item
    if (item.stockStatus === 'LOW' || item.stockStatus === 'STOCKOUT') {
        const needed = item.maxStock - item.calculatedStock;
        const donor = results.find(other => 
            other.sku === item.sku && 
            other.branch !== item.branch && 
            other.stockStatus === 'HIGH' &&
            other.calculatedStock > other.maxStock
        );

        if (donor) {
            const availableTransfer = donor.calculatedStock - donor.maxStock;
            const suggestedTransferQty = Math.min(needed, availableTransfer);
            if (suggestedTransferQty > 0) {
                return { 
                    ...item, 
                    abcClass, 
                    suggestedTransferQty, 
                    transferSourceBranch: donor.branch,
                    suggestedOrderQty: Math.max(0, item.suggestedOrderQty - suggestedTransferQty)
                };
            }
        }
    }
    
    return { ...item, abcClass };
  });

  return finalResults;
};