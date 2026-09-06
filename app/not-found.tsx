import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-mono text-sm text-zinc-600">404</p>
      <h1 className="font-sans text-xl font-semibold text-zinc-100">Nothing placed on this slot.</h1>
      <p className="max-w-md text-sm text-zinc-500">
        That route doesn&rsquo;t exist. Head back to the workbench and keep writing.
      </p>
      <Link
        href="/workbench"
        className="mt-2 rounded-md border border-zinc-800/50 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
      >
        Back to the workbench
      </Link>
    </div>
  );
}
