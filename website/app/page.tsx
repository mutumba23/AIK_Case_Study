import Layout from "../components/Layout";
import Link from "next/link";

export default function Home() {
  return (
    <Layout>
      <h2 className="text-3xl font-semibold mb-4">
        ⚽ AIK Coaching Philosophy & Financial Strategy
      </h2>
      <p className="mb-6">
        This project analyzes AIK’s coaching selection patterns to evaluate
        alignment with the club’s financial model — balancing experience,
        performance, and player development.
      </p>

      <Link
        href="/analysis"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        View Analysis →
      </Link>
    </Layout>
  );
}
