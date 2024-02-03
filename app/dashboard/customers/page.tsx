import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';
import Table from '@/app/ui/customers/table';
import { fetchFilteredCustomers } from '@/app/lib/data';
// import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
 
export const metadata: Metadata = {
  title: 'Customers',
};
 
export default async function Page() {
  const customers = (await fetchFilteredCustomers(''))

  return (
    <div className="w-full">
      <Table customers={customers} />
    </div>
  );
}