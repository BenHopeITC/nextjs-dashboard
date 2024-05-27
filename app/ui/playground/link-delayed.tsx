import { clsx } from 'clsx';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { fetchNothing } from '@/app/lib/data-api';

interface DelayedLinkProps {
  delayInSecs: number;
}

export default async function DelayedLink({ delayInSecs }: DelayedLinkProps) {
  await fetchNothing(delayInSecs);

  return <Link href="/dashboard">Dashboard Home</Link>;
}
