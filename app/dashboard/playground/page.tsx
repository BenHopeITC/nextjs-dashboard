import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { fetchNothing } from '@/app/lib/data-api';
import { Suspense } from 'react';
import DelayedLink from '@/app/ui/playground/link-delayed';
import Counter from '@/app/ui/playground/counter';

export const metadata: Metadata = {
  title: 'Playground',
};

export default async function Page() {
  await fetchNothing(2);

  return (
    <>
      <div className="w-full">Playground</div>
      <br />
      <br />
      <Suspense fallback={<p>Loading &apos;Dashboard Home&apos; link...</p>}>
        <DelayedLink delayInSecs={1} />
      </Suspense>
      <Counter />
    </>
  );
}
