"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = {
  src: string;
  alt: string;
};

type BuyImageGalleryProps = {
  images: GalleryImage[];
};

export default function BuyImageGallery({ images }: BuyImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full aspect-[4/3] lg:aspect-[5/4] overflow-hidden rounded-[30px] bg-gradient-to-b from-white to-brand-gray-light shadow-[0_22px_60px_rgba(86,17,110,0.10)]">
        <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 55vw"
          className="object-contain p-0 sm:p-1 scale-[1.12] rotate-[-2deg] transition-transform duration-700 hover:scale-[1.16]"
        />
      </div>

      <div className="flex items-center justify-center gap-3">
        {images.map((image, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-[78px] w-[78px] sm:h-[92px] sm:w-[92px] overflow-hidden rounded-[18px] border bg-white transition-all duration-300 ${
                isActive
                  ? "border-brand-purple shadow-[0_14px_28px_rgba(86,17,110,0.18)] scale-[1.04]"
                  : "border-brand-purple/10 opacity-80 hover:opacity-100 hover:border-brand-purple/25"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="92px"
                className="object-contain p-2"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}