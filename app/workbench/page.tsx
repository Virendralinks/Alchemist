import { RealityFlipper } from '@/components/reality/RealityFlipper';
import { SequencerBoard } from '@/components/sequencer/SequencerBoard';
import { SuggestColumn } from '@/components/suggest/SuggestColumn';

/**
 * Composes the Sequencer + Reality + Suggest islands (Phase 3).
 * Each pane is a client island; this page itself stays an RSC shell.
 */
export default function WorkbenchPage() {
  return (
    <div className="grid h-full grid-cols-[1fr_2fr_1fr] divide-x divide-zinc-800/50">
      <section className="overflow-hidden p-4">
        <RealityFlipper />
      </section>

      <section className="overflow-y-auto p-4">
        <SequencerBoard />
      </section>

      <section className="overflow-hidden p-4">
        <SuggestColumn />
      </section>
    </div>
  );
}
