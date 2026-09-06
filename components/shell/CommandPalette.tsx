'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

const DESTINATIONS = [
  { href: '/workbench', label: 'Workbench' },
  { href: '/dissect', label: 'Bar Dissector' },
  { href: '/lineage', label: 'Lineage' },
  { href: '/archive', label: 'Archive' },
  { href: '/codex', label: 'Codex' },
];

/** Global keyboard (cmd/ctrl+k) — this, plus cmdk, is what forces the client boundary. */
export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Go to">
          {DESTINATIONS.map((d) => (
            <CommandItem
              key={d.href}
              onSelect={() => {
                setOpen(false);
                router.push(d.href);
              }}
            >
              {d.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
