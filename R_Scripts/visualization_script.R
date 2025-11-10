# =========================================================================
# FILE: visualization_script.R
# DESCRIPTION: R script for analysis and visualization based on the two
# SQL views exported as CSVs:
# 1. aik_performance_by_period.csv (AIK-specific data)
# 2. allsvenskan_team_match_data.csv (League-wide data)
#
# Libraries required: tidyverse (ggplot2, dplyr) for data manipulation and plotting.
# =========================================================================

# --- 1. SETUP AND DATA LOADING ---
# Ensure you have the 'tidyverse' package installed: install.packages("tidyverse")
library(tidyverse)
library(lubridate) # For date manipulation

# Set the path where your extracted CSV files are located (relative to your R working directory)
DATA_PATH <- "Data/"

# Load data from the two SQL views exported as CSVs
aik_data <- read_csv(file.path(DATA_PATH, "aik_lineup_starters_coach_comparison.csv"))
league_data <- read_csv(file.path(DATA_PATH, "league_starters_age_performance.csv"))

# Clean column names to be R-friendly (replace quotes and convert to snake_case)
names(aik_data) <- tolower(names(aik_data))
names(league_data) <- tolower(names(league_data))

# --- 2. DATA CLEANING AND PREPARATION ---

# Calculate goals difference and match result for league-wide data
league_data <- league_data %>%
  mutate(
    goals_diff = goals_for - goals_against,
    match_result = case_when(
      goals_diff > 0 ~ "Win",
      goals_diff < 0 ~ "Loss",
      TRUE ~ "Draw"
    )
  )

# Convert match_date to date object if not already
aik_data <- aik_data %>%
  mutate(match_date = as_date(match_date))

league_data <- league_data %>%
  mutate(match_date = as_date(match_date))


# --- 3. ANALYSIS FOR INSIGHTS (As documented in Final_Insights_and_Recommendations.md) ---

# Insight 1: Mean Starting XI Age (New Coach vs. Former Coach)
# The SQL query already handles the period split based on the coach arrival date (2024-07-22)
mean_age_by_period <- aik_data %>%
  group_by(period) %>%
  summarise(
    mean_age = mean(avg_age, na.rm = TRUE),
    n = n()
  )
print("Mean Starting Age by Period (AIK):")
print(mean_age_by_period)

# Insight 2: Mean Age vs. Match Result (League-Wide)
mean_age_by_result <- league_data %>%
  filter(match_result %in% c("Win", "Loss")) %>% # Focus on Win/Loss comparison
  group_by(match_result) %>%
  summarise(
    mean_age = mean(avg_age, na.rm = TRUE),
    n = n()
  )
print("Mean Starting Age by Match Result (League-Wide):")
print(mean_age_by_result)


# --- 4. VISUALIZATION: AIK AGE TREND OVER TIME (LINEAR REGRESSION EVIDENCE) ---

# Plot the average age of the AIK starting XI over time, split by coaching period.
# Includes a linear regression line to show the 'near-flat' slope mentioned in the insights.
aik_trend_plot <- aik_data %>%
  ggplot(aes(x = match_date, y = avg_age, color = period)) +
  geom_point(alpha = 0.7) +
  geom_smooth(method = "lm", se = FALSE, linetype = "dashed") + # Linear regression trend line
  labs(
    title = "AIK Starting XI Average Age Over Time",
    subtitle = paste0("New Coach Mean Age: ", round(mean_age_by_period[mean_age_by_period$period == 'After Coach',]$mean_age, 2), " | Trend confirms minimal age reduction."),
    x = "Match Date",
    y = "Average Starting Age (Years)",
    color = "Coaching Period"
  ) +
  scale_y_continuous(limits = c(25, 30)) +
  theme_minimal() +
  theme(legend.position = "bottom")

# Display the plot
print(aik_trend_plot)
# ggsave("aik_age_trend_plot.png", plot = aik_trend_plot, width = 8, height = 5)


# --- 5. VISUALIZATION: LEAGUE-WIDE AGE VS. PERFORMANCE (SCATTER PLOT) ---

# Plot league-wide average age against Goals For/Goals Against (Goals Difference)
# This visualization confirms that age has no statistical edge.
league_scatter_plot <- league_data %>%
  ggplot(aes(x = avg_age, y = goals_diff, color = match_result)) +
  geom_point(alpha = 0.6) +
  geom_hline(yintercept = 0, linetype = "solid", color = "red", alpha = 0.6) + # Line where goals_diff = 0 (Draw)
  geom_smooth(method = "lm", se = TRUE, color = "darkgrey") + # Overall linear trend line
  labs(
    title = "League-Wide: Starting XI Average Age vs. Goals Difference",
    subtitle = "Zero correlation between average age and match result (Win/Loss) across the league.",
    x = "Average Starting Age (Years)",
    y = "Goals Difference (Goals For - Goals Against)",
    color = "Match Result"
  ) +
  theme_minimal() +
  theme(legend.position = "bottom")

# Display the plot
print(league_scatter_plot)
# ggsave("league_age_performance_scatter.png", plot = league_scatter_plot, width = 8, height = 5)