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
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-white">
        <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="object-contain p-4 sm:p-6 transition-transform duration-500 hover:scale-[1.02]"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex items-center justify-center gap-3">
        {images.map((image, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-[72px] w-[72px] sm:h-[82px] sm:w-[82px] overflow-hidden rounded-[16px] border bg-white transition-all duration-300 ${
                isActive
                  ? "border-brand-purple shadow-[0_10px_24px_rgba(86,17,110,0.12)]"
                  : "border-brand-purple/10 opacity-80 hover:opacity-100 hover:border-brand-purple/25"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="82px"
                className="object-contain p-2"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}