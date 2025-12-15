"use client";

import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface ProductSidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showInStockOnly: boolean;
  onStockFilterChange: (inStock: boolean) => void;
}

export function ProductSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  showInStockOnly,
  onStockFilterChange
}: ProductSidebarProps) {
  const t = useTranslations('Products');

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
        <h2 className="text-lg font-heading font-bold text-gray-900 mb-6">
          {t('filters')}
        </h2>

        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {t('category')}
          </h3>
          <div className="space-y-2">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onCategoryChange(null)}
            >
              {t('allCategories')}
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onCategoryChange(null)}
            >
              <X className="w-4 h-4 mr-1" />
              {t('clear')}
            </Button>
          )}
        </div>

        {/* Stock Filter */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={showInStockOnly}
              onCheckedChange={(checked) => onStockFilterChange(checked as boolean)}
            />
            <Label
              htmlFor="inStock"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {t('showInStockOnly')}
            </Label>
          </div>
        </div>
      </div>
    </aside>
  );
}
