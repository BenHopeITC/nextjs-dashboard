import Link from 'next/link'
 
export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <h3>Sub Home</h3>
      <Link href="/about">About</Link>
    </div>
  )
}