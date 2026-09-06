'use client';

import { useEffect } from 'react';
import { useWorkbenchStore } from '@/lib/store';

/**
 * Records that a device page was opened. Rendered as a leaf so the surrounding
 * page can stay a Server Component.
 */
export function DeviceSeenTracker({ deviceId }: { deviceId: string }) {
  useEffect(() => {
    useWorkbenchStore.getState().markSeen(deviceId);
  }, [deviceId]);

  return null;
}
