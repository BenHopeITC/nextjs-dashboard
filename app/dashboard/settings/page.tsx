import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { fetchTodoData, Todo } from '@/app/lib/data-api';
 
export const metadata: Metadata = {
  title: 'Settings',
};
 
export default async function Page() {
  const todos: Todo[] = await fetchTodoData()
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Settings</h1>
      </div>
      <div className="flex w-full items-center justify-between">
        <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.userId} | {todo.id} | {todo.title} | {todo.completed}</li>
        ))}
        </ul>
      </div>
    </div>
  );
}