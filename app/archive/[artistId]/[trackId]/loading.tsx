import { Skeleton } from '@/components/ui/skeleton';

export default function TrackLoading() {
  return (
    <div className="grid h-full grid-cols-[1fr_2fr_1fr] divide-x divide-zinc-800/50">
      {[0, 1, 2].map((col) => (
        <section key={col} className="flex flex-col gap-3 p-4">
          <Skeleton className="h-4 w-24 bg-zinc-800/60" />
          <Skeleton className="h-3 w-full bg-zinc-800/60" />
          <Skeleton className="h-3 w-5/6 bg-zinc-800/60" />
          <Skeleton className="h-3 w-2/3 bg-zinc-800/60" />
        </section>
      ))}
    </div>
  );
}
