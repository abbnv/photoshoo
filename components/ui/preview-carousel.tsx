'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewCarouselProps {
  slides: ReactNode[];
  className?: string;
  slideClassName?: string;
  itemClassName?: string;
  selectedIndex?: number;
  onSelectChange?: (index: number) => void;
}

export function PreviewCarousel({
  slides,
  className,
  slideClassName,
  itemClassName,
  selectedIndex,
  onSelectChange,
}: PreviewCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(slides.length > 1);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    onSelectChange?.(emblaApi.selectedScrollSnap());
  }, [emblaApi, onSelectChange]);

  useEffect(() => {
    if (!emblaApi) return;
    updateButtons();
    emblaApi.on('select', updateButtons);
    emblaApi.on('reInit', updateButtons);

    return () => {
      emblaApi.off('select', updateButtons);
      emblaApi.off('reInit', updateButtons);
    };
  }, [emblaApi, updateButtons]);

  useEffect(() => {
    if (!emblaApi || typeof selectedIndex !== 'number' || selectedIndex < 0) return;
    requestAnimationFrame(() => {
      emblaApi.scrollTo(selectedIndex);
    });
  }, [emblaApi, selectedIndex, slides.length]);

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={cn(
                'min-w-0 flex-[0_0_86%] pl-4 sm:flex-[0_0_78%] lg:flex-[0_0_68%]',
                itemClassName,
                slideClassName
              )}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Предыдущий слайд"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Следующий слайд"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
