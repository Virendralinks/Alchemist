'use client';

import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { Dumbbell } from 'lucide-react';
import { useWorkbenchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { MOTION } from '@/lib/motion';

/**
 * Closes the loop between studying a technique and using it: loads the practice
 * template into the sequencer, counts the attempt, and navigates to the bench.
 */
export function PracticeButton({
  deviceId,
  hasTemplate,
}: {
  deviceId: string;
  hasTemplate: boolean;
}) {
  const practiceDevice = useWorkbenchStore((s) => s.practiceDevice);
  const practiced = useWorkbenchStore((s) => s.mastery[deviceId]?.practiced ?? 0);
  const router = useRouter();

  if (!hasTemplate) return null;

  return (
    <div className="flex items-center gap-2">
      <m.div whileTap={{ scale: 0.97 }} transition={{ duration: MOTION.grab }}>
        <Button
          size="sm"
          className="h-7 gap-1.5 font-sans text-xs"
          onClick={() => {
            practiceDevice(deviceId);
            router.push('/workbench');
          }}
        >
          <Dumbbell className="size-3" />
          Practice this device
        </Button>
      </m.div>
      {practiced > 0 && (
        <span className="font-mono text-[10px] tabular text-zinc-500">
          practiced {practiced}×
        </span>
      )}
    </div>
  );
}
