import Link from 'next/link'
 
export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <h2>Sub Home</h2>
      <Link href="/about">About</Link>
    </div>
  )
}