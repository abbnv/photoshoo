'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepContactSheetProps {
  images: string[];
  onContinue: () => void;
}

export default function StepContactSheet({ images, onContinue }: StepContactSheetProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-none">
      <h2 className="text-2xl font-bold mb-2 text-center">Ваши сгенерированные портреты</h2>
      <p className="text-muted-foreground text-center mb-8">
        Сгенерировано {images?.length ?? 0} портретов. Нажмите на любое изображение для увеличения.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {(images ?? []).map((url, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelected(url)}
            className="aspect-[9/16] rounded-lg overflow-hidden bg-muted cursor-pointer group relative shadow-md hover:shadow-lg transition-shadow"
          >
            <img src={url} alt={`Портрет ${i + 1}`} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={onContinue} className="gap-2">
          Перейти к результатам <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Просмотр */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X className="w-8 h-8" />
          </button>
          <img
            src={selected}
            alt="Просмотр"
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
