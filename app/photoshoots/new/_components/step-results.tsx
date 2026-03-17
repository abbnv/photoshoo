'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Eye, Plus, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepResultsProps {
  photoshootId: number | null;
}

export default function StepResults({ photoshootId }: StepResultsProps) {
  const router = useRouter();

  return (
    <div className="max-w-none text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
      </motion.div>
      <h2 className="text-3xl font-bold mb-3">Фотосессия завершена!</h2>
      <p className="text-muted-foreground mb-8">
        Ваши ИИ-портреты сгенерированы и сохранены. Вы можете просматривать, скачивать или делиться ими в любое время.
      </p>

      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => router.push(`/photoshoots/${photoshootId}`)}
        >
          <Eye className="w-4 h-4" /> Посмотреть фотосессию
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full gap-2"
          onClick={() => router.push('/photoshoots/new')}
        >
          <Plus className="w-4 h-4" /> Создать ещё одну
        </Button>
        <Button
          size="lg"
          variant="ghost"
          className="w-full gap-2"
          onClick={() => router.push('/photoshoots')}
        >
          <LayoutDashboard className="w-4 h-4" /> На главную
        </Button>
      </div>
    </div>
  );
}
