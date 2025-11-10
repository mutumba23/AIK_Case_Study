import Layout from "../../components/Layout";
import Image from "next/image";

export default function Analysis() {
  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">📊 Key Findings</h2>
      <p className="mb-6">
        The analysis revealed a conflict between the coach’s experienced
        philosophy and the club’s long-term financial strategy.
      </p>

      <h3 className="text-xl font-semibold mt-8 mb-2">
        Finding 1: The Coach Prefers Stability Over Youth
      </h3>
      <p className="mb-4">
        The new coach maintains a higher average starting age (27.48 vs. 27.24)
        compared to his predecessor, indicating reliance on an established core.
      </p>
      <Image
        src="/visualizations/avg_age_starting_XI_trend_with_offseason.png"
        alt="Average Age Starting XI Trend"
        width={800}
        height={400}
      />


      <h3 className="text-xl font-semibold mt-8 mb-2">
        Finding 2: Age Has No Competitive Advantage
      </h3>
      <p className="mb-4">
        League-wide data shows that older lineups do not outperform younger
        ones — mean ages of winning and losing teams are nearly identical.
      </p>
      <Image
        src="/visualizations/avg_age_by_result_all_teams_boxplot.png"
        alt="Age vs Result"
        width={800}
        height={400}
        className="rounded-xl shadow-md mb-6"
      />
    </Layout>
  );
}
