export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  promotionalPrice?: number;
  stock: number;
  attributes: {
    size?: string;
    flavor?: string;
    color?: string;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  images: string[];
  basePrice: number;
  promotionalPrice?: number;
  variants: ProductVariant[];
  features: string[];
  ingredients: string[];
  inStock: boolean;
  lowStock: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Dips",
    slug: "dips",
    description: "A chocolate made to tease. Crafted with pure Arriba Cocoa Nibs and natural aphrodisiac ingredients - Maca Root Powder, L-Theanine, Ginger Powder, and Fenugreek Powder - Dips awakens the senses, ignites desire, and turns shared pleasure into an intense and irresistible experience.",
    shortDescription: "Unwrap your passion",
    category: "Chocolate",
    images: [
      "/images/hero-2.png",
    ],
    basePrice: 24.99,
    promotionalPrice: 19.99,
    variants: [
      {
        id: "1-1",
        sku: "DIPS-BAR-001",
        name: "Single Bar",
        price: 19.99,
        stock: 150,
        attributes: {
          size: "Single"
        }
      },
      {
        id: "1-2",
        sku: "DIPS-BAR-003",
        name: "3-Pack",
        price: 54.99,
        promotionalPrice: 49.99,
        stock: 85,
        attributes: {
          size: "3-Pack"
        }
      },
      {
        id: "1-3",
        sku: "DIPS-BAR-006",
        name: "6-Pack",
        price: 99.99,
        promotionalPrice: 89.99,
        stock: 45,
        attributes: {
          size: "6-Pack"
        }
      }
    ],
    features: [
      "Made with pure Arriba Cocoa Nibs",
      "Natural aphrodisiac ingredients",
      "Maca Root, L-Theanine, Ginger & Fenugreek",
      "Eco-friendly and sustainable"
    ],
    ingredients: [
      "Cocoa Nibs (Arriba)",
      "Sugar",
      "Cocoa Butter",
      "Maca Root Powder",
      "L-Theanine",
      "Ginger Powder",
      "Fenugreek Powder",
      "Sunflower Lecithin"
    ],
    inStock: true,
    lowStock: false,
    featured: true,
    rating: 4.9,
    reviewCount: 234
  }
];

// Helper functions
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getVariantById(productId: string, variantId: string): ProductVariant | undefined {
  const product = getProductById(productId);
  return product?.variants.find(v => v.id === variantId);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.featured);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}

export function getLowStockProducts(): Product[] {
  return products.filter(p => p.lowStock || p.variants.some(v => v.stock < 10));
}
