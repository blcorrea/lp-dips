"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, X } from 'lucide-react';

interface ProductFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showInStockOnly: boolean;
  onStockFilterChange: (inStock: boolean) => void;
}

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  showInStockOnly,
  onStockFilterChange
}: ProductFiltersProps) {
  const t = useTranslations('Products');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {t('filters')}
        </Button>
      </div>

      {/* Filters */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
        {/* Categories */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
            {t('category')}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === null
                ? 'bg-brand-purple text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('allCategories')}
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                  ? 'bg-brand-purple text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
            {selectedCategory && (
              <button
                onClick={() => onCategoryChange(null)}
                className="px-3 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                {t('clear')}
              </button>
            )}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <Label className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide block">
            {t('sortBy')}
          </Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">{t('featured')}</SelectItem>
              <SelectItem value="price-asc">{t('priceLowToHigh')}</SelectItem>
              <SelectItem value="price-desc">{t('priceHighToLow')}</SelectItem>
              <SelectItem value="name-asc">{t('nameAZ')}</SelectItem>
              <SelectItem value="rating-desc">{t('highestRated')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stock Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock-filters"
            checked={showInStockOnly}
            onCheckedChange={(checked) => onStockFilterChange(checked as boolean)}
          />
          <Label
            htmlFor="inStock-filters"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {t('showInStockOnly')}
          </Label>
        </div>
      </div>
    </div>
  );
}
