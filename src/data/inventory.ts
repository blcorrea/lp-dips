import { products } from './products';

export interface InventoryItem {
  sku: string;
  productId: string;
  variantId: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  lastRestocked?: string;
  supplier?: string;
}

export interface StockAlert {
  sku: string;
  productName: string;
  variantName: string;
  currentStock: number;
  reorderPoint: number;
  severity: 'low' | 'critical' | 'out_of_stock';
  message: string;
}

// Build inventory from products
export const inventory: InventoryItem[] = products.flatMap(product =>
  product.variants.map(variant => ({
    sku: variant.sku,
    productId: product.id,
    variantId: variant.id,
    currentStock: variant.stock,
    reservedStock: Math.floor(variant.stock * 0.1), // 10% reserved for pending orders
    availableStock: Math.floor(variant.stock * 0.9),
    reorderPoint: 20,
    reorderQuantity: 100,
    lastRestocked: getRandomRecentDate(),
    supplier: "DPIS Manufacturing Co."
  }))
);

// Helper function to generate random recent dates
function getRandomRecentDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.setDate(now.getDate() - daysAgo));
  return date.toISOString();
}

// Helper functions
export function getInventoryBySku(sku: string): InventoryItem | undefined {
  return inventory.find(i => i.sku === sku);
}

export function getInventoryByProductId(productId: string): InventoryItem[] {
  return inventory.filter(i => i.productId === productId);
}

export function getStockAlerts(): StockAlert[] {
  const alerts: StockAlert[] = [];

  inventory.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    const variant = product?.variants.find(v => v.id === item.variantId);

    if (!product || !variant) return;

    let severity: 'low' | 'critical' | 'out_of_stock' | null = null;
    let message = '';

    if (item.availableStock === 0) {
      severity = 'out_of_stock';
      message = 'Out of stock - Reorder immediately';
    } else if (item.availableStock < 10) {
      severity = 'critical';
      message = `Critical stock level - Only ${item.availableStock} units remaining`;
    } else if (item.availableStock < item.reorderPoint) {
      severity = 'low';
      message = `Stock below reorder point (${item.reorderPoint} units)`;
    }

    if (severity) {
      alerts.push({
        sku: item.sku,
        productName: product.name,
        variantName: variant.name,
        currentStock: item.availableStock,
        reorderPoint: item.reorderPoint,
        severity,
        message
      });
    }
  });

  return alerts.sort((a, b) => {
    const severityOrder = { out_of_stock: 0, critical: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export function isInStock(sku: string): boolean {
  const item = getInventoryBySku(sku);
  return item ? item.availableStock > 0 : false;
}

export function getAvailableStock(sku: string): number {
  const item = getInventoryBySku(sku);
  return item ? item.availableStock : 0;
}

export function checkStockAvailability(sku: string, quantity: number): {
  available: boolean;
  message?: string;
  availableQuantity: number;
} {
  const item = getInventoryBySku(sku);

  if (!item) {
    return {
      available: false,
      message: 'Product not found',
      availableQuantity: 0
    };
  }

  if (item.availableStock === 0) {
    return {
      available: false,
      message: 'Out of stock',
      availableQuantity: 0
    };
  }

  if (quantity > item.availableStock) {
    return {
      available: false,
      message: `Only ${item.availableStock} units available`,
      availableQuantity: item.availableStock
    };
  }

  return {
    available: true,
    availableQuantity: item.availableStock
  };
}

export function reserveStock(sku: string, quantity: number): boolean {
  const item = getInventoryBySku(sku);
  if (!item) return false;

  if (item.availableStock >= quantity) {
    item.availableStock -= quantity;
    item.reservedStock += quantity;
    return true;
  }

  return false;
}

export function releaseStock(sku: string, quantity: number): boolean {
  const item = getInventoryBySku(sku);
  if (!item) return false;

  if (item.reservedStock >= quantity) {
    item.reservedStock -= quantity;
    item.availableStock += quantity;
    return true;
  }

  return false;
}

export function fulfillStock(sku: string, quantity: number): boolean {
  const item = getInventoryBySku(sku);
  if (!item) return false;

  if (item.reservedStock >= quantity) {
    item.reservedStock -= quantity;
    item.currentStock -= quantity;
    return true;
  }

  return false;
}

// Get low stock products for alerts
export function getLowStockItems(): InventoryItem[] {
  return inventory.filter(item => item.availableStock < item.reorderPoint);
}

export function getCriticalStockItems(): InventoryItem[] {
  return inventory.filter(item => item.availableStock < 10);
}

export function getOutOfStockItems(): InventoryItem[] {
  return inventory.filter(item => item.availableStock === 0);
}
