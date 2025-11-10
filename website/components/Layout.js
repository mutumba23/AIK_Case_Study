import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 text-white py-4">
        <nav className="max-w-5xl mx-auto flex justify-between px-4">
          <h1 className="font-bold text-lg">AIK Coaching Analysis</h1>
          <div className="space-x-4">
            <Link href="/">Home</Link>
            <Link href="/analysis">Analysis</Link>
            <Link href="/methodology">Methodology</Link>
            <Link href="/recommendations">Recommendations</Link>
            <Link href="/about">About</Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl mx-auto p-6">{children}</main>

      <footer className="bg-gray-200 text-center py-4 text-sm text-gray-700">
        © {new Date().getFullYear()} Philip Nilsson | AIK Data Case Study
      </footer>
    </div>
  );
}
