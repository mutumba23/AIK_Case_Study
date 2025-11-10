import Layout from "../../components/Layout";

export default function Recommendations() {
  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">
        🎯 Strategic Recommendations
      </h2>

      <p className="mb-4">
        Given that age does not correlate with success, AIK should focus on
        integrating younger players to balance performance and financial growth.
      </p>

      <ul className="list-disc ml-6 space-y-2">
        <li>
          Set an age target between <strong>25.0–25.5 years</strong> for the
          starting XI.
        </li>
        <li>
          Make youth integration a consistent strategy rather than a fallback
          during injury periods.
        </li>
        <li>
          Focus recruitment on younger, high-potential players for sustainable
          transfer value.
        </li>
      </ul>
    </Layout>
  );
}
