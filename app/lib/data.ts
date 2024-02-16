'use server';

import { PrismaClient } from '@prisma/client'
import { unstable_noStore as noStore } from 'next/cache';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

const prisma = new PrismaClient()

// uses watefall approach, each fetch completed before the next is started.
export async function fetchCardData() {
  noStore()
  try {
    const numberOfCustomers = (await prisma.customers.count()) ?? 0
    const numberOfInvoices = (await prisma.invoices.count()) ?? 0
    const totalPaidInvoices = formatCurrency((await prisma.invoices.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'paid',
      }
    }))._sum.amount ?? 0)
    const totalPendingInvoices = formatCurrency((await prisma.invoices.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'pending',
      }
    }))._sum.amount ?? 0)

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}
// NEEDED??
// fetchCardData()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })

// fetch data in parallel

export async function fetchCardDataParallel() {
    noStore()
    try {
      console.log('Fetching card data...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      type InvoiceTotals = {
        paid: number;
        pending: number;
      };

      // You can probably combine these into a single SQL query
      // However, we are intentionally splitting them to demonstrate
      // how to initialize multiple queries in parallel with JS.
      const invoiceCountPromise = await prisma.$queryRaw<{ count: number}[]>`
      SELECT COUNT(*) FROM invoices;
      `;
      const customerCountPromise = await prisma.$queryRaw<{ count: number}[]>`
      SELECT COUNT(*) FROM customers;
      `;
      const invoiceStatusPromise = await prisma.$queryRaw<InvoiceTotals[]>`
      SELECT
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
      FROM invoices
      `;
  
      const data = await Promise.all([
        invoiceCountPromise,
        customerCountPromise,
        invoiceStatusPromise,
      ]);
  
      const numberOfInvoices = Number(data[0][0].count);
      const numberOfCustomers = Number(data[1][0].count);
      const totalPaidInvoices = formatCurrency(Number(data[2][0].paid ?? '0'));
      const totalPendingInvoices = formatCurrency(Number(data[2][0].pending ?? '0'));
    
      return {
        numberOfCustomers,
        numberOfInvoices,
        totalPaidInvoices,
        totalPendingInvoices,
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch card data.');
    }
  }

export async function fetchRevenue() {
  noStore()
  try {
    // Artificially delay a response for demo purposes.
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await prisma.revenue.findMany()

    console.log('Data fetch completed after 3 seconds.');

    return data
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  noStore()
  try {
    console.log('Fetching invoice data...');
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const data = await prisma.$queryRaw<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
    
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch latest invoice data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  noStore()
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.$queryRaw<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  noStore()
  try {
    const result: any = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(result[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  noStore()
  try {
    const data = await prisma.$queryRaw<InvoiceForm[]>`
      SELECT
        id,
        customer_id,
        amount,
        status
      FROM invoices
      WHERE id = cast(${id} as UUID);
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    console.log(invoice); // Invoice is an empty array []
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  noStore()
  try {
    const data = await prisma.$queryRaw<CustomerField[]>`
      SELECT id, name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  noStore()
  try {
    const data = await prisma.$queryRaw<CustomersTableType[]>`
		SELECT
      cast(customers.id as UUID),
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_invoices: Number(customer.total_invoices),
      total_pending: formatCurrency(Number(customer.total_pending)),
      total_paid: formatCurrency(Number(customer.total_paid)),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  noStore()
  try {
    const user = await prisma.$queryRaw<User[]>`
    SELECT * FROM users WHERE email=${email}
    `;
    return user[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
