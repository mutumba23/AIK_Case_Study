import Layout from "../../components/Layout";

export default function Methodology() {
  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">🧠 Tools & Methodology</h2>

      <ul className="list-disc ml-6 space-y-2">
        <li>
          <strong>Data Source:</strong> ESPN Soccer Data via{" "}
          <a
            href="https://www.kaggle.com/datasets/excel4soccer/espn-soccer-data"
            className="text-blue-600 hover:underline"
          >
            Kaggle
          </a>
        </li>
        <li>
          <strong>Processing:</strong> PostgreSQL for schema setup, cleaning, and
          extraction.
        </li>
        <li>
          <strong>Analysis:</strong> R (tidyverse / ggplot2) for visualization.
        </li>
        <li>
          <strong>Python:</strong> Used for initial ETL and data cleanup before
          loading into PostgreSQL.
        </li>
      </ul>
    </Layout>
  );
}
