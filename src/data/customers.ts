export interface Address {
  id: string;
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  birthDate?: string;
  addresses: Address[];
  wishlist: string[]; // Product IDs
  createdAt: string;
  lastPurchase?: string;
  totalOrders: number;
  totalSpent: number;
}

// Mock customer data (simulating a logged-in user)
export const mockCustomer: Customer = {
  id: "CUST-001",
  email: "demo@dpis.com",
  name: "João Silva",
  phone: "+55 11 98765-4321",
  birthDate: "1990-05-15",
  addresses: [
    {
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
    {
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
    }
  ],
  wishlist: ["2", "5"], // Tropical and Variety Pack
  createdAt: "2024-01-15T10:30:00Z",
  lastPurchase: "2025-11-20T14:22:00Z",
  totalOrders: 8,
  totalSpent: 287.45
};

// Additional mock customers for admin/demo purposes
export const mockCustomers: Customer[] = [
  mockCustomer,
  {
    id: "CUST-002",
    email: "maria@example.com",
    name: "Maria Santos",
    phone: "+55 21 91234-5678",
    addresses: [
      {
        id: "ADDR-003",
        name: "Residência",
        street: "Av. Atlântica",
        number: "500",
        neighborhood: "Copacabana",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "22070-001",
        country: "Brasil",
        isDefault: true
      }
    ],
    wishlist: ["1", "4"],
    createdAt: "2024-03-20T08:15:00Z",
    lastPurchase: "2025-12-01T16:45:00Z",
    totalOrders: 15,
    totalSpent: 542.30
  },
  {
    id: "CUST-003",
    email: "carlos@example.com",
    name: "Carlos Mendes",
    phone: "+55 31 99876-5432",
    addresses: [
      {
        id: "ADDR-004",
        name: "Casa",
        street: "Rua da Bahia",
        number: "789",
        neighborhood: "Centro",
        city: "Belo Horizonte",
        state: "MG",
        zipCode: "30160-011",
        country: "Brasil",
        isDefault: true
      }
    ],
    wishlist: ["3"],
    createdAt: "2024-06-10T12:00:00Z",
    lastPurchase: "2025-11-28T10:30:00Z",
    totalOrders: 5,
    totalSpent: 189.75
  }
];

// Helper functions
export function getCustomerById(id: string): Customer | undefined {
  return mockCustomers.find(c => c.id === id);
}

export function getDefaultAddress(customer: Customer): Address | undefined {
  return customer.addresses.find(a => a.isDefault);
}

export function addToWishlist(customerId: string, productId: string): boolean {
  const customer = getCustomerById(customerId);
  if (customer && !customer.wishlist.includes(productId)) {
    customer.wishlist.push(productId);
    return true;
  }
  return false;
}

export function removeFromWishlist(customerId: string, productId: string): boolean {
  const customer = getCustomerById(customerId);
  if (customer) {
    const index = customer.wishlist.indexOf(productId);
    if (index > -1) {
      customer.wishlist.splice(index, 1);
      return true;
    }
  }
  return false;
}

export function isInWishlist(customerId: string, productId: string): boolean {
  const customer = getCustomerById(customerId);
  return customer ? customer.wishlist.includes(productId) : false;
}
