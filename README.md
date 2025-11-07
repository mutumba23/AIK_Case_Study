# ⚽ AIK Coaching Philosophy & Financial Strategy Case Study 🎯

## 1. Project Overview: The Business Problem
This project analyzes the team selection patterns of the new AIK football coach to assess their alignment with the club's financial strategy.  

Since top European leagues rely heavily on selling young talent for high transfer fees, a coaching philosophy that neglects youth development can suppress a key revenue stream.  

**Primary Business Question:**  
Does the new coach's preference for older players impede the club's financial strategy without providing a competitive performance benefit?

---

## 🛠️ 2. Tools & Methodology

| Component               | Tool / Language           | Purpose                                                                                   |
|-------------------------|--------------------------|-------------------------------------------------------------------------------------------|
| Data Sourcing           | Kaggle                   | Initial dataset acquisition (Team Lineup & Match Results). [ESPN Soccer Data](https://www.kaggle.com/datasets/excel4soccer/espn-soccer-data) |
| Data Processing         | PostgreSQL               | ETL (Extract, Transform, Load), rigorous cleaning, defining schema (PK/FKs), and extracting specialized datasets. |
| Analysis & Visualization| R (tidyverse / ggplot2)  | Statistical analysis (mean, standard deviation, linear regression) and generating final visualizations. |

**Data Citation:**  
- **ESPN Soccer Data (Kaggle)** – Dataset used for team lineups and match results.  
  [https://www.kaggle.com/datasets/excel4soccer/espn-soccer-data](https://www.kaggle.com/datasets/excel4soccer/espn-soccer-data)  

---

## ⚙️ 3. Data Processing & Integrity
A crucial step was building a reliable dataset by cleaning and transforming the raw data within a PostgreSQL database environment.

- **Schema Definition:** Established proper data types, Primary Keys, and Foreign Keys to enforce data integrity.  
- **Data Cleaning:** Removed all duplicate and inconsistent records.  
- **Targeted Extraction:** Two distinct datasets were generated:  
  - **AIK-Only Data:** Filtered for AIK games and starting XI only, adding a period column for coach comparison.  
  - **All-League Data:** Filtered for the starting XI of all teams, used to generalize the age vs. performance relationship.  

➡️ See the `SQL_Scripts/` directory for all schema definitions and extraction queries.

---

## 📊 4. Key Findings & Visual Evidence
The analysis revealed a conflict between the coach's stable, experienced philosophy and the club's financial model.

### Finding 1: The Coach Prefers Stability Over Youth
- The new coach maintains a significantly higher mean starting age and a near-flat internal trend, indicating a reliance on an established core team.  
- **Metric:** Mean Starting XI Age (New Coach: 27.48 years vs. Former Coach: 27.24 years)  
- **Evidence:** The trend line's minimal negative slope (from linear regression) confirms that age has not been consistently reduced over his tenure.

### Finding 2: Age Has No Competitive Advantage
- Analysis across all 944 team-games in the league shows that older lineups provide no statistical edge in performance.  
- **Metric:** Mean Age vs. Match Result (Win/Loss)  
- **Result:** The mean age for winning teams (**25.78 years**) and losing teams (**25.79 years**) is statistically identical.  
- **Interpretation:** Shifting to a younger lineup presents a low-risk strategy for the club.

---

## 🎯 5. Final Recommendation
The current coaching philosophy is sub-optimal for AIK's financial sustainability.

**Conclusion:**  
Given that age does not correlate with success, the coach's stable, experienced selections effectively suppress the transfer valuation of the club's young assets by limiting consistent playing time.

**Strategic Recommendation:**  
AIK should mandate a strategic pivot for the current coach:
- **Set an Age Target:** Reduce the mean starting XI age to a stable range of 25.0 to 25.5 years (closer to the league average).  
- **Enforce Consistent Integration:** Require youth development to be a consistent part of the weekly strategy, not merely an episodic necessity during periods of injury or end-of-season evaluation.

---

## 📂 6. Repository Structure

| Directory / File          | Description                                                      |
|----------------------------|------------------------------------------------------------------|
| `README.md`               | The document you are currently reading (Project Summary).        |
| `Data/`                   | Contains the final CSV files used for R visualization.           |
| `Visualizations/`         | Contains the three exported PNG image files.                     |
| `SQL_Scripts/`            | Schema, Cleaning, and Final Extraction Queries used in PostgreSQL. |
| `R_Scripts/visualization.R` | The complete R script used for all analysis and plotting.        |
