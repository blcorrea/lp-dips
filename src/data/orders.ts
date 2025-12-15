import { Address } from './customers';

export type OrderStatus =
  | 'pending_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay'
  | 'klarna'
  | 'afterpay';

export interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image?: string;
}

export interface OrderTracking {
  status: OrderStatus;
  date: string;
  location?: string;
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  billingAddress: Address;
  tracking: OrderTracking[];
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  notes?: string;
}

// Mock orders data
export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    orderNumber: "DPIS-2025-001234",
    customerId: "CUST-001",
    customerName: "João Silva",
    customerEmail: "demo@dpis.com",
    items: [
      {
        productId: "1",
        productName: "DPIS Energy Drink - Original",
        variantId: "1-3",
        variantName: "12-Pack (250ml)",
        sku: "DPIS-ORG-12PK",
        quantity: 2,
        unitPrice: 34.99,
        subtotal: 69.98,
        image: "/images/product-1.jpg"
      },
      {
        productId: "4",
        productName: "DPIS Energy Drink - Citrus Charge",
        variantId: "4-1",
        variantName: "250ml Can",
        sku: "DPIS-CTR-250",
        quantity: 6,
        unitPrice: 3.49,
        subtotal: 20.94,
        image: "/images/product-4.jpg"
      }
    ],
    subtotal: 90.92,
    shippingCost: 12.00,
    tax: 9.09,
    discount: 10.00,
    total: 102.01,
    status: "delivered",
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    shippingAddress: {
      id: "ADDR-001",
      name: "Casa",
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Jardim Paulista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      country: "Brasil",
      isDefault: true
    },
    billingAddress: {
      id: "ADDR-001",
      name: "Casa",
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Jardim Paulista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      country: "Brasil",
      isDefault: true
    },
    tracking: [
      {
        status: "pending_payment",
        date: "2025-11-15T10:00:00Z",
        description: "Order placed, awaiting payment confirmation"
      },
      {
        status: "payment_confirmed",
        date: "2025-11-15T10:05:00Z",
        description: "Payment confirmed successfully"
      },
      {
        status: "processing",
        date: "2025-11-15T14:30:00Z",
        location: "DPIS Warehouse - São Paulo",
        description: "Order is being prepared"
      },
      {
        status: "shipped",
        date: "2025-11-16T09:00:00Z",
        location: "DPIS Warehouse - São Paulo",
        description: "Package shipped via Express Delivery"
      },
      {
        status: "in_transit",
        date: "2025-11-17T08:30:00Z",
        location: "Distribution Center - São Paulo",
        description: "Package in transit"
      },
      {
        status: "out_for_delivery",
        date: "2025-11-18T07:00:00Z",
        location: "Local Delivery Hub - Jardim Paulista",
        description: "Out for delivery"
      },
      {
        status: "delivered",
        date: "2025-11-18T15:22:00Z",
        location: "Rua das Flores, 123 - São Paulo, SP",
        description: "Package delivered successfully"
      }
    ],
    createdAt: "2025-11-15T10:00:00Z",
    updatedAt: "2025-11-18T15:22:00Z",
    notes: "Ring doorbell upon arrival"
  },
  {
    id: "ORD-002",
    orderNumber: "DPIS-2025-001245",
    customerId: "CUST-001",
    customerName: "João Silva",
    customerEmail: "demo@dpis.com",
    items: [
      {
        productId: "5",
        productName: "DPIS Variety Pack",
        variantId: "5-1",
        variantName: "24-Pack Variety (6 of each flavor)",
        sku: "DPIS-VAR-24PK",
        quantity: 1,
        unitPrice: 49.99,
        subtotal: 49.99,
        image: "/images/product-variety.jpg"
      }
    ],
    subtotal: 49.99,
    shippingCost: 10.00,
    tax: 5.00,
    discount: 0,
    total: 64.99,
    status: "in_transit",
    paymentMethod: "apple_pay",
    paymentStatus: "paid",
    shippingAddress: {
      id: "ADDR-002",
      name: "Trabalho",
      street: "Av. Paulista",
      number: "1000",
      complement: "10º andar",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
      country: "Brasil",
      isDefault: false
    },
    billingAddress: {
      id: "ADDR-001",
      name: "Casa",
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Jardim Paulista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      country: "Brasil",
      isDefault: true
    },
    tracking: [
      {
        status: "pending_payment",
        date: "2025-12-10T14:20:00Z",
        description: "Order placed"
      },
      {
        status: "payment_confirmed",
        date: "2025-12-10T14:20:30Z",
        description: "Payment confirmed via Apple Pay"
      },
      {
        status: "processing",
        date: "2025-12-10T16:00:00Z",
        location: "DPIS Warehouse - São Paulo",
        description: "Order is being prepared"
      },
      {
        status: "shipped",
        date: "2025-12-11T10:00:00Z",
        location: "DPIS Warehouse - São Paulo",
        description: "Package shipped"
      },
      {
        status: "in_transit",
        date: "2025-12-12T09:15:00Z",
        location: "Distribution Center - São Paulo",
        description: "Package in transit to destination"
      }
    ],
    createdAt: "2025-12-10T14:20:00Z",
    updatedAt: "2025-12-12T09:15:00Z",
    estimatedDelivery: "2025-12-14T18:00:00Z"
  },
  {
    id: "ORD-003",
    orderNumber: "DPIS-2025-001256",
    customerId: "CUST-001",
    customerName: "João Silva",
    customerEmail: "demo@dpis.com",
    items: [
      {
        productId: "2",
        productName: "DPIS Energy Drink - Tropical",
        variantId: "2-2",
        variantName: "500ml Can",
        sku: "DPIS-TRP-500",
        quantity: 4,
        unitPrice: 6.99,
        subtotal: 27.96,
        image: "/images/product-2.jpg"
      },
      {
        productId: "3",
        productName: "DPIS Energy Drink - Berry Blast",
        variantId: "3-1",
        variantName: "250ml Can",
        sku: "DPIS-BRY-250",
        quantity: 3,
        unitPrice: 4.99,
        subtotal: 14.97,
        image: "/images/product-3.jpg"
      }
    ],
    subtotal: 42.93,
    shippingCost: 8.00,
    tax: 4.29,
    discount: 5.00,
    total: 50.22,
    status: "processing",
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    shippingAddress: {
      id: "ADDR-001",
      name: "Casa",
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Jardim Paulista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      country: "Brasil",
      isDefault: true
    },
    billingAddress: {
      id: "ADDR-001",
      name: "Casa",
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Jardim Paulista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      country: "Brasil",
      isDefault: true
    },
    tracking: [
      {
        status: "pending_payment",
        date: "2025-12-14T11:30:00Z",
        description: "Order placed"
      },
      {
        status: "payment_confirmed",
        date: "2025-12-14T11:32:00Z",
        description: "Payment confirmed"
      },
      {
        status: "processing",
        date: "2025-12-14T13:00:00Z",
        location: "DPIS Warehouse - São Paulo",
        description: "Order is being prepared for shipment"
      }
    ],
    createdAt: "2025-12-14T11:30:00Z",
    updatedAt: "2025-12-14T13:00:00Z",
    estimatedDelivery: "2025-12-18T18:00:00Z"
  }
];

// Helper functions
export function getOrderById(id: string): Order | undefined {
  return mockOrders.find(o => o.id === id);
}

export function getOrderByNumber(orderNumber: string): Order | undefined {
  return mockOrders.find(o => o.orderNumber === orderNumber);
}

export function getOrdersByCustomerId(customerId: string): Order[] {
  return mockOrders.filter(o => o.customerId === customerId).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLatestTracking(order: Order): OrderTracking | undefined {
  return order.tracking[order.tracking.length - 1];
}

export function getOrderStatusDisplay(status: OrderStatus): { label: string; color: string } {
  const statusMap: Record<OrderStatus, { label: string; color: string }> = {
    pending_payment: { label: 'Pending Payment', color: 'orange' },
    payment_confirmed: { label: 'Payment Confirmed', color: 'green' },
    processing: { label: 'Processing', color: 'blue' },
    shipped: { label: 'Shipped', color: 'purple' },
    in_transit: { label: 'In Transit', color: 'purple' },
    out_for_delivery: { label: 'Out for Delivery', color: 'purple' },
    delivered: { label: 'Delivered', color: 'green' },
    cancelled: { label: 'Cancelled', color: 'red' },
    refunded: { label: 'Refunded', color: 'gray' }
  };
  return statusMap[status];
}

export function canReorder(order: Order): boolean {
  return order.status === 'delivered' || order.status === 'cancelled';
}

export function canCancel(order: Order): boolean {
  return order.status === 'pending_payment' ||
         order.status === 'payment_confirmed' ||
         order.status === 'processing';
}
