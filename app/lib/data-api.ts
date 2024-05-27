'use server';

// import { unstable_noStore as noStore } from 'next/cache';

export type Todo = {
  userId: string,
  id: string,
  title: string,
  completed: boolean
}

export async function fetchTodoData() {
  // noStore()

  const res = await fetch('https://jsonplaceholder.typicode.com/todos', { cache: 'no-store' })

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  return await res.json() as Todo[];
}

export async function fetchNothing(delayInSecs: number) {
  console.log('Fetching nothing...');

  // used to introduce a delay
  await new Promise((resolve) => setTimeout(resolve, delayInSecs * 1000));
}