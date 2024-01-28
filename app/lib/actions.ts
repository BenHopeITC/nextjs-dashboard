'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const prisma = new PrismaClient()
 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
      invalid_type_error: 'Please select an invoice status.',
    }),
  date: z.string(),
});
 
// Use Zod to update the expected types
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // For complex forms use below:
  //const rawFormData = Object.fromEntries(formData.entries())
  //const rawFormData = {
  //  customerId: formData.get('customerId'),
  //  amount: formData.get('amount'),
  //  status: formData.get('status'),
  //};
  //// Test it out:
  //console.log(rawFormData);
  //console.log(typeof rawFormData.amount);

  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  console.log(`validatedFields: ${JSON.stringify(validatedFields)}`)

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
 
  const amountInCents = validatedFields.data.amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  try {
    await prisma.$executeRaw`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (CAST(${validatedFields.data.customerId} as uuid), ${amountInCents}, ${validatedFields.data.status}, CAST(${date} as date))
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const amountInCents = validatedFields.data.amount * 100;
 
  try {
    await prisma.$executeRaw`
      UPDATE invoices
      SET customer_id = CAST(${validatedFields.data.customerId} as UUID), amount = ${amountInCents}, status = ${validatedFields.data.status}
      WHERE id = CAST(${id} as UUID)
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice 1');
  
  try {
    // throw new Error('Failed to Delete Invoice 2');
    await prisma.$executeRaw`DELETE FROM invoices WHERE id = CAST(${id} as UUID)`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}