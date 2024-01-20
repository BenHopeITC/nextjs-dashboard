'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient()
 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string().uuid(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function createInvoice(formData: FormData) {
  // For complex forms use below:
  //const rawFormData = Object.fromEntries(formData.entries())

//   const rawFormData = {
//     customerId: formData.get('customerId'),
//     amount: formData.get('amount'),
//     status: formData.get('status'),
//   };
//   // Test it out:
//   console.log(rawFormData);
//   console.log(typeof rawFormData.amount);

  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await prisma.$executeRaw`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (CAST(${customerId} as uuid), ${amountInCents}, ${status}, CAST(${date} as date))
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}