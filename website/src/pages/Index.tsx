import { useEffect, useRef, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import avgAgeStartingXI from "@/assets/avg_age_starting_XI_trend_with_offseason.png";
import newCoachInternal from "@/assets/new_coach_internal_trend.png";
import avgAgeByResult from "@/assets/avg_age_by_result_all_teams_boxplot.png";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-r";
import { FileCode, Database, FileText, File } from "lucide-react";
import { formatBytes, getPublicFileSize } from "@/lib/fileUtils";

// --- START: FINAL INSIGHTS CONTENT FOR PARSING ---
const FINAL_INSIGHTS_CONTENT = `
🧩 Final Insights and Recommendations

📘 Project Summary

The objective of this analysis was to determine if a correlation exists between the average starting lineup age and match performance (Goals For/Against) — specifically for the client’s team AIK (Team ID 994) — and to compare this trend before and after the arrival of the new coach (post–July 22, 2024).
This analysis successfully generated two key datasets (views in SQL_Scripts/final_extraction.sql) which were visualized using R to reveal a conflict between the coach’s stable, experienced philosophy and the club’s financial model.
📊 Top High-Level Insights (Based on Visualizations)

1. 🧠 AIK Coach Prefers Stability Over Youth

The new coach has maintained a starting lineup with a slightly higher mean age compared to his predecessor, indicating a philosophical reliance on an established, experienced core team.
Metric: Mean Starting XI Age (New Coach: 27.48 years vs. Former Coach: 27.24 years)
Evidence: The trend line exhibits a near-flat internal trend (minimal negative slope), confirming that the coach has not consistently reduced the average age over his tenure.
Interpretation: The coaching philosophy prioritizes stability and experience over the integration of younger players, which may conflict with the club’s long-term financial strategy.
📈 Visualization:

2. ⚖️ Age Has No Competitive Advantage League-Wide

Analysis across all team-games in the Allsvenskan league demonstrates that an older, more expensive lineup provides no statistical edge in competitive performance.
Metric: Mean Age vs. Match Result (Win/Loss)
Result: The mean age for winning teams (25.78 years) and losing teams (25.79 years) is statistically identical.
Interpretation: Shifting the club’s recruitment strategy toward leveraging equally competitive younger, higher-potential players presents a low-risk, financially sustainable strategy without sacrificing immediate competitive results.
📉 Visualization:
🧭 Recommendations and Next Steps (Act)

1. ✅ Actionable Recommendation for AIK Management

Address Strategy Conflict:
Management should present the age-neutral performance data to the coaching staff. The goal is to encourage a shift in philosophy to utilize the high-potential youth pipeline without fearing a drop in competitive level, as the data proves age is not a competitive advantage.
Recruitment Mandate:
Implement a policy to focus recruitment spending on younger players (under 24) for starting positions, as this is proven to be a low-risk strategy for maintaining match results while maximizing future transfer revenue.
2. 🚀 Future Deliverables and Data Expansion
`;
// --- END: FINAL INSIGHTS CONTENT FOR PARSING ---

const PUBLIC_PATH_MAP: Record<string, string> = {
  "Python_Scripts/initial_processing.py": "/python/initial_processing.py",
  "SQL_Scripts/schema_setup.sql": "/sql/schema_setup.sql",
  "SQL_Scripts/cleaning_validation.sql": "/sql/cleaning_validation.sql",
  "SQL_Scripts/final_extraction.sql": "/sql/final_extraction.sql",
  "R_Scripts/visualization_script.R": "/r/visualization_script.R",
};

const Index = () => {
  const sectionsRef = useRef<HTMLElement[]>([]);

  // --- Parsing Logic using useMemo ---
  const parsedContent = useMemo(() => {
    const content: any = {};
    const text = FINAL_INSIGHTS_CONTENT;

    // 1. Executive Summary / Hero Section
    const summaryMatch = text.match(/Project Summary\s*[\n\r]+(.+?)\s*[\n\r]+(.+?)[\n\r]+📊/s);
    if (summaryMatch) {
      content.overviewSummary = summaryMatch[2].trim().replace(/\r?\n/g, ' '); // Second paragraph is the key takeaway
    } else {
        content.overviewSummary = "The analysis revealed a conflict: the coach's stable, experienced philosophy is sub-optimal for the club's financial sustainability.";
    }

    // 2. Finding 1 Metrics and Narrative
    const f1MetricMatch = text.match(/New Coach: (\d+\.\d+) years vs\. Former Coach: (\d+\.\d+) years/);
    if (f1MetricMatch) {
      content.f1NewCoachAge = f1MetricMatch[1];
      content.f1FormerCoachAge = f1MetricMatch[2];
      content.f1Title = text.match(/1\. 🧠 (.+?)\n/)?.[1].trim();
    } else {
        content.f1NewCoachAge = "27.48";
        content.f1FormerCoachAge = "27.24";
        content.f1Title = "Finding 1: The Coach Prefers Stability Over Youth";
    }

    const f1SummaryMatch = text.match(/1\. 🧠 AIK Coach Prefers Stability Over Youth\s*[\n\r]+(.+?)[\n\r]+Metric/s);
    if (f1SummaryMatch) {
        content.f1Summary = f1SummaryMatch[1].trim().replace(/\r?\n/g, ' ');
    } else {
        content.f1Summary = "The new coach has maintained a starting lineup with a slightly higher mean age compared to his predecessor, indicating a philosophical reliance on an established, experienced core team.";
    }

    const f1EvidenceMatch = text.match(/Evidence: (.+?)[\n\r]+Interpretation/s);
    if (f1EvidenceMatch) {
      content.f1Evidence = f1EvidenceMatch[1].trim();
    } else {
        content.f1Evidence = "The trend line exhibits a near-flat internal trend (minimal negative slope), confirming that the coach has not consistently reduced the average age over his tenure.";
    }

    // 3. Finding 2 Metrics and Narrative
    const f2MetricMatch = text.match(/winning teams \((\d+\.\d+) years\) and losing teams \((\d+\.\d+) years\)/);
    if (f2MetricMatch) {
      content.f2WinAge = f2MetricMatch[1];
      content.f2LossAge = f2MetricMatch[2];
      content.f2Title = text.match(/2\. ⚖️ (.+?)\n/)?.[1].trim();
    } else {
        content.f2WinAge = "25.78";
        content.f2LossAge = "25.79";
        content.f2Title = "Finding 2: Age Has No Competitive Advantage League-Wide";
    }
    
    const f2SummaryMatch = text.match(/2\. ⚖️ Age Has No Competitive Advantage League-Wide\s*[\n\r]+(.+?)[\n\r]+Metric/s);
    if (f2SummaryMatch) {
        content.f2Summary = f2SummaryMatch[1].trim().replace(/\r?\n/g, ' ');
    } else {
        content.f2Summary = "Analysis across all team-games in the Allsvenskan league demonstrates that an older, more expensive lineup provides no statistical edge in competitive performance.";
    }

    const f2InterpretationMatch = text.match(/Result: .+?[\n\r]+Interpretation: (.+?)[\n\r]+📉/s);
    if (f2InterpretationMatch) {
        content.f2Interpretation = f2InterpretationMatch[1].trim().replace(/\r?\n/g, ' ');
    } else {
        content.f2Interpretation = "Shifting the club’s recruitment strategy toward leveraging equally competitive younger, higher-potential players presents a low-risk, financially sustainable strategy without sacrificing immediate competitive results.";
    }


    // 4. Strategic Recommendation Conclusion & List
    const conclusionMatch = text.match(/Interpretation: (.+?)[\n\r]+📈/s);
    if (conclusionMatch) {
        // Using the Interpretation from Finding 1 as the narrative bridge for the Recommendation section
        content.recommendationConclusion = conclusionMatch[1].trim().replace(/\r?\n/g, ' ');
    } else {
        content.recommendationConclusion = "Given that age does not correlate with success, the coach's stable, experienced selections effectively suppress the transfer valuation of the club's young assets.";
    }

    const recListMatch = text.match(/1\. ✅ Actionable Recommendation for AIK Management\n(.+?)2\. 🚀 Future Deliverables/s);
    if (recListMatch) {
        const rawList = recListMatch[1].trim();
        content.recommendationList = [
            {
                title: rawList.match(/Address Strategy Conflict:\s*([\s\S]+?)Recruitment Mandate/)?.[1].trim().replace(/\r?\n/g, ' '),
                heading: "Address Strategy Conflict"
            },
            {
                title: rawList.match(/Recruitment Mandate:\s*([\s\S]+)/)?.[1].trim().replace(/\r?\n/g, ' '),
                heading: "Recruitment Mandate"
            }
        ];
    } else {
        // Fallback to original hardcoded list if parsing fails
        content.recommendationList = [
            { heading: "Set an Age Target", title: "Establish a target mean age (e.g., 25.0 to 25.5 years) to align with optimal asset appreciation." },
            { heading: "Enforce Consistent Integration", title: "Require systematic rotation of youth players to maximize their market value and long-term financial sustainability." },
        ];
    }


    return content;
  }, []);
  // --- End Parsing Logic ---


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-4");
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  // Prefetch sizes for files published in PUBLIC_PATH_MAP
  useEffect(() => {
    Object.values(PUBLIC_PATH_MAP).forEach((p) => {
      getPublicFileSize(p).then((size: number | null) => {
        setFileSizes((s) => ({ ...s, [p]: size }));
      });
    });
  }, []);

  

  // Generic file viewer state (supports one file open at a time)
  const [currentPublicPath, setCurrentPublicPath] = useState<string | null>(null);
  const [currentHighlighted, setCurrentHighlighted] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [fileSizes, setFileSizes] = useState<Record<string, number | null>>({});

  // Map repo file paths to public URLs where copies are placed (use top-level constant)
  const publicPathMap = PUBLIC_PATH_MAP;

  const toggleShowFile = async (publicPath: string) => {
    // If the file is already shown, hide it
    if (currentPublicPath === publicPath) {
      setCurrentPublicPath(null);
      setCurrentHighlighted(null);
      setCodeError(null);
      return;
    }

    // Otherwise fetch the file and show it (with syntax highlighting)
    setLoadingCode(true);
    setCodeError(null);
    try {
      const res = await fetch(publicPath);
      if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
      const text = await res.text();

      // Determine language from extension
      const ext = publicPath.split('.').pop() || "";
      const langMap: Record<string, string> = { py: "python", sql: "sql", r: "r" };
      const lang = langMap[ext] ?? "text";

      // Highlight using Prism
  const grammar = (Prism.languages as unknown as Record<string, unknown>)[lang] || Prism.languages["text"];
      const highlighted = Prism.highlight(text, grammar, lang);
      setCurrentHighlighted(highlighted);
      setCurrentPublicPath(publicPath);
    } catch (err: unknown) {
      setCodeError(err instanceof Error ? err.message : String(err ?? "Failed to load file"));
      setCurrentPublicPath(publicPath);
      setCurrentHighlighted(null);
    } finally {
      setLoadingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Executive Summary - Hero Section - UPDATED */}
      <section
        ref={addToRefs}
        className="opacity-0 translate-y-4 transition-all duration-700 bg-gradient-to-br from-aik-black to-hero-to py-20 px-4 sm:px-6 md:px-6"
      >
          <div className="max-w-4xl mx-auto text-center px-2">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-aik-yellow">
            AIK Coaching Philosophy vs. Financial Strategy
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold mb-6 sm:mb-8 text-white">
            An Age Analysis
          </h2>
          <div className="bg-aik-yellow/5 border-2 border-aik-yellow rounded-lg p-4 sm:p-6 mt-8 sm:mt-12">
            <p className="text-base sm:text-xl md:text-2xl leading-relaxed text-white">
              {parsedContent.overviewSummary}
            </p>
          </div>
        </div>
      </section>

      <Separator className="bg-divider" />

      {/* Key Findings & Visual Evidence - UPDATED */}
      <section
        ref={addToRefs}
        className="opacity-0 translate-y-4 transition-all duration-700 py-12 sm:py-16 px-4 sm:px-6"
      >
          <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <h2 className="text-4xl font-bold mb-16 text-center text-aik-yellow border-b-4 border-aik-yellow inline-block pb-2">
            Key Findings & Visual Evidence
          </h2>
          <div className="w-full text-center mb-16"></div>

          {/* Finding 1 */}
          <Card className="bg-finding p-6 sm:p-8 mb-12 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-aik-yellow">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-aik-black">
              {parsedContent.f1Title?.replace(/🧠/g, '').trim()}
            </h3>
            
            {/* Finding 1 Summary Text */}
            <p className="text-lg text-aik-gray mb-6 leading-relaxed">
              {parsedContent.f1Summary}
            </p>

            <div className="bg-aik-yellow/5 border border-aik-yellow rounded-lg p-6 mb-8">
              <p className="text-xl text-aik-black">
                <span className="font-bold text-aik-yellow">Key Metric:</span> New Coach Mean Age:{" "}
                <span className="font-bold text-aik-yellow">{parsedContent.f1NewCoachAge} years</span> vs. Former Coach:{" "}
                <span className="font-bold text-aik-yellow">{parsedContent.f1FormerCoachAge} years</span>
              </p>
            </div>
            
            {/* Finding 1 Evidence Text */}
            <p className="text-lg text-aik-black mb-10 leading-relaxed">
                <span className="font-semibold text-aik-yellow">Visual Evidence:</span> {parsedContent.f1Evidence}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img
                  src={avgAgeStartingXI}
                  alt="Average age of starting XI trend with offseason markers"
                  className="w-full h-auto"
                />
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Historical Age Trend Across Seasons
                </p>
              </div>
              <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img
                  src={newCoachInternal}
                  alt="New coach internal age trend comparison"
                  className="w-full h-auto"
                />
                <p className="text-sm text-muted-foreground text-center mt-2">
                  New Coach vs. Former Coach Age Patterns
                </p>
              </div>
            </div>
          </Card>

          {/* Finding 2 */}
          <Card className="bg-finding p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-aik-yellow">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-aik-black">
              {parsedContent.f2Title?.replace(/⚖️/g, '').trim()}
            </h3>
            
            {/* Finding 2 Summary Text */}
            <p className="text-lg text-aik-gray mb-6 leading-relaxed">
              {parsedContent.f2Summary}
            </p>

            <div className="bg-aik-yellow/5 border border-aik-yellow rounded-lg p-6 mb-8">
              <p className="text-xl text-aik-black">
                <span className="font-bold text-aik-yellow">Key Metric:</span> Winning Teams Mean Age:{" "}
                <span className="font-bold text-aik-yellow">{parsedContent.f2WinAge} years</span> vs. Losing Teams:{" "}
                <span className="font-bold text-aik-yellow">{parsedContent.f2LossAge} years</span>
              </p>
            </div>
            
            {/* Finding 2 Interpretation Text */}
            <p className="text-lg text-aik-black mb-10 leading-relaxed">
                <span className="font-semibold text-aik-yellow">Interpretation:</span> {parsedContent.f2Interpretation}
            </p>

            <div className="max-w-4xl mx-auto">
              <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img
                  src={avgAgeByResult}
                  alt="Average age by match result for all teams - box plot"
                  className="w-full h-auto"
                />
                <p className="text-sm text-muted-foreground text-center mt-2">
                  League-Wide Age Distribution by Match Result
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Separator className="bg-divider" />

      {/* Strategic Recommendation - UPDATED */}
      <section
        ref={addToRefs}
        className="opacity-0 translate-y-4 transition-all duration-700 bg-aik-yellow/5 py-12 sm:py-16 px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-aik-yellow border-b-4 border-aik-yellow inline-block pb-2">
            Strategic Recommendation
          </h2>
          <div className="w-full text-center mb-12"></div>
          <Card className="bg-finding p-10 shadow-lg border-2 border-aik-yellow">
            <div className="mb-8 p-6 bg-aik-yellow/5 border-l-4 border-aik-yellow rounded">
              <p className="text-xl leading-relaxed text-aik-black font-medium">
                {parsedContent.recommendationConclusion}
              </p>
            </div>
            <h3 className="text-2xl font-bold mb-6 text-aik-yellow">
              Mandate for Change:
            </h3>
            <ul className="space-y-4">
              {parsedContent.recommendationList?.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-aik-yellow font-bold text-2xl mr-4">{index + 1}.</span>
                  <p className="text-lg pt-1 text-aik-black">
                    <span className="font-semibold text-aik-yellow">{item.heading}:</span>
                    {" "}{item.title}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <Separator className="bg-divider" />

      {/* Methodology & Audit Trail */}
      <section
        ref={addToRefs}
        className="opacity-0 translate-y-4 transition-all duration-700 py-12 sm:py-16 px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto px-2 sm:px-0">
          <h2 className="text-4xl font-bold mb-12 text-center text-aik-yellow border-b-4 border-aik-yellow inline-block pb-2">
            Methodology & Audit Trail
          </h2>
          <div className="w-full text-center mb-12"></div>
          
          <Card className="bg-finding p-6 sm:p-8 mb-8 shadow-lg border-l-4 border-aik-yellow">
                    <h3 className="text-xl sm:text-2xl font-bold mb-8 text-aik-yellow">Tools Used</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-aik-yellow/5 border border-aik-yellow rounded-lg text-center hover:bg-aik-yellow/20 transition-colors">
                <p className="font-semibold text-lg text-aik-black">Kaggle Data</p>
                <p className="text-sm text-aik-gray">Data Source</p>
              </div>
              <div className="p-4 bg-aik-yellow/5 border border-aik-yellow rounded-lg text-center hover:bg-aik-yellow/20 transition-colors">
                <p className="font-semibold text-lg text-aik-black">Python</p>
                <p className="text-sm text-aik-gray">Data Extraction</p>
              </div>
              <div className="p-4 bg-aik-yellow/5 border border-aik-yellow rounded-lg text-center hover:bg-aik-yellow/20 transition-colors">
                        <p className="font-semibold text-base sm:text-lg text-aik-black">PostgreSQL</p>
                        <p className="text-xs sm:text-sm text-aik-gray">Database Management</p>
              </div>
              <div className="p-4 bg-aik-yellow/5 border border-aik-yellow rounded-lg text-center hover:bg-aik-yellow/20 transition-colors">
                <p className="font-semibold text-lg text-aik-black">R (tidyverse/ggplot2)</p>
                <p className="text-sm text-aik-gray">Data Visualization</p>
              </div>
            </div>
          </Card>

          <Card className="bg-finding p-6 sm:p-8 shadow-lg border-l-4 border-aik-yellow">
                    <h3 className="text-xl sm:text-2xl font-bold mb-6 text-aik-yellow">Codebase & Documentation</h3>
            <p className="text-aik-gray mb-6">
              Complete analysis pipeline with reproducible code:
            </p>
            <div className="space-y-3">
              {[
                { name: "initial_processing.py", path: "Python_Scripts/initial_processing.py", desc: "Data extraction and preprocessing" },
                { name: "schema_setup.sql", path: "SQL_Scripts/schema_setup.sql", desc: "Database schema definition" },
                { name: "cleaning_validation.sql", path: "SQL_Scripts/cleaning_validation.sql", desc: "Data validation and cleaning queries" },
                { name: "final_extraction.sql", path: "SQL_Scripts/final_extraction.sql", desc: "Final analytical queries" },
                { name: "visualization_script.R", path: "R_Scripts/visualization_script.R", desc: "Chart generation and styling" },
              ].map((file, index) => (
                <div
                  key={index}
                  className="p-4 bg-aik-yellow/5 border border-aik-yellow/30 rounded-lg hover:bg-aik-yellow/5 hover:border-aik-yellow transition-colors duration-200 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono font-semibold text-sm sm:text-base text-aik-black group-hover:text-aik-yellow transition-colors break-all">
                        {file.path}
                      </p>
                      <p className="text-sm text-aik-gray mt-1">{file.desc}</p>
                    </div>
                    <span className="text-xs text-aik-black bg-aik-yellow/5 px-2 py-1 rounded border border-aik-yellow/30">
                      {file.path.split('/')[0]}
                    </span>
                  </div>

                  {/* Actions: download + show code (for any file we published to public/) */}
                  {(() => {
                    const publicPath = publicPathMap[file.path];
                    if (!publicPath) return null;

                    // file extension for download label
                    const ext = file.name.split('.').pop();

                    return (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0 mt-4">
                          <a
                            className="inline-flex items-center gap-2 bg-aik-yellow text-aik-black font-semibold px-3 py-2 rounded border border-aik-yellow/50 hover:opacity-90 w-full sm:w-auto justify-center"
                            href={publicPath}
                            download
                          >
                            {/* Icon */}
                            {(() => {
                              const e = ext?.toLowerCase();
                              if (e === "py") return <FileCode size={16} />;
                              if (e === "sql") return <Database size={16} />;
                              if (e === "r") return <FileText size={16} />;
                              return <File size={16} />;
                            })()}
                            <span>Download .{ext}</span>
                          </a>

                          <button
                            onClick={() => toggleShowFile(publicPath)}
                            className="inline-block bg-aik-yellow/5 text-aik-black border border-aik-yellow px-3 py-2 rounded hover:bg-aik-yellow/20 w-full sm:w-auto"
                          >
                            {currentPublicPath === publicPath ? "Hide code" : "Show code"}
                          </button>

                          <div className="mt-1 sm:mt-0 sm:ml-3 text-sm text-aik-gray text-center sm:text-left">{formatBytes(fileSizes[publicPath] ?? null)}</div>
                        </div>

                        {currentPublicPath === publicPath && (
                          <div className="mt-4">
                            {loadingCode ? (
                              <p className="text-sm text-aik-gray">Loading code...</p>
                            ) : codeError ? (
                              <p className="text-sm text-red-500">{codeError}</p>
                            ) : currentHighlighted ? (
                                      <pre className="rounded bg-slate-900 text-white p-4 overflow-auto text-xs sm:text-sm max-h-[60vh] md:max-h-[50vh]">
                                        <code className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: currentHighlighted }} />
                                      </pre>
                            ) : null}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-aik-black text-white py-8 px-6 border-t-4 border-aik-yellow">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm">
            Case Study by <span className="text-aik-yellow font-semibold">Philip Nilsson</span> • AIK Coaching Philosophy & Financial Strategy Analysis © 2025
          </p>
          <p className="text-xs mt-2 text-aik-yellow/80">
            Built with professional data storytelling principles
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;