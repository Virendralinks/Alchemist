'use client';

import { usePathname } from 'next/navigation';
import { FlaskConical, Scissors, GitFork, Library, BookOpen } from 'lucide-react';
import { NavItem } from './NavItem';

const NAV_SECTIONS = [
  { href: '/workbench', label: 'Workbench', icon: FlaskConical },
  { href: '/dissect', label: 'Dissector', icon: Scissors },
  { href: '/lineage', label: 'Lineage', icon: GitFork },
  { href: '/archive', label: 'Archive', icon: Library },
  { href: '/codex', label: 'Codex', icon: BookOpen },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-1 border-r border-zinc-800/50 bg-zinc-950 p-3">
      <div className="mb-4 px-3 pt-2">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          The Alchemist&rsquo;s
        </p>
        <p className="font-mono text-sm font-semibold text-zinc-100">Workbench</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_SECTIONS.map((section) => (
          <NavItem
            key={section.href}
            href={section.href}
            label={section.label}
            icon={section.icon}
            active={pathname === section.href || pathname.startsWith(`${section.href}/`)}
          />
        ))}
      </nav>
    </aside>
  );
}
