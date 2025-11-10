-- =========================================================================
-- FILE: final_extraction.sql
-- DESCRIPTION: Contains the final analytical SQL queries (SELECT statements)
-- used to extract and structure the data for the 'Analyze' and 'Share' phases.
-- These results were exported to be visualized in tools like Tableau, R or Excel.
-- =========================================================================

-- Note: The analysis focuses primarily on the starting lineup, as substitution
-- data was found to be too sparse for reliable comparison (See cleaning_validation.sql).

-- -------------------------------------------------------------------------
-- ANALYSIS VIEW 1: AIK Match Age and Performance Split (Before/After Coach)
--
-- Rationale: This complex CTE structure prepares a dataset specifically for
-- AIK (TeamId = 994), calculating the average age of the starting XI and
-- splitting the results into two distinct periods based on the coach's
-- arrival date (2024-07-22). This view allows for direct comparative analysis.
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW aik_performance_by_period AS
-- Define coach arrival date for easy modification
WITH params AS (
    SELECT DATE '2024-07-22' AS coach_arrival
),

-- 1. Lineup data with player ages (only starters)
lineup_with_age AS (
    SELECT
        l."eventId",
        l."teamId",
        -- Calculate player age based on match date and date of birth
        EXTRACT(YEAR FROM AGE(f."date", p."dateOfBirth")) AS player_age,
        f."date" AS match_date
    FROM "lineup" l
    JOIN "players" p ON l."athleteId" = p."athleteId"
    JOIN "fixtures" f ON l."eventId" = f."eventId"
    WHERE l."teamId" = 994 -- AIK's teamId
      AND l."starter" = TRUE -- Only starters
),

-- 2. Substitutions aggregated per match (included but acknowledged as sparse)
subs_agg AS (
    SELECT
        pd."eventId",
        COUNT(DISTINCT pd."athleteId") FILTER (WHERE pd."typeId" = 76) AS subs_made, -- typeId 76 is Substitution
        -- Note: The original query used the Plays data table (playsdata),
        -- which is mapped to the 'KeyEvents' table in the schema setup for consistency.
        AVG(EXTRACT(YEAR FROM AGE(f."date", p."dateOfBirth"))) AS avg_sub_age
    FROM "keyevents" pd
    JOIN "players" p ON pd."athleteId" = p."athleteId"
    JOIN "fixtures" f ON pd."eventId" = f."eventId"
    WHERE pd."teamId" = 994
      AND pd."typeId" = 76 -- Substitution events only
    GROUP BY pd."eventId"
),

-- 3. Lineup metrics aggregated per match (only starters)
lineup_agg AS (
    SELECT
        "eventId",
        AVG(player_age) AS avg_age,
        MIN(player_age) AS youngest,
        MAX(player_age) AS oldest
    FROM lineup_with_age
    GROUP BY "eventId"
)

-- Final extraction query
SELECT
    la."eventId",
    f."date" AS match_date,
    la.avg_age,
    la.youngest,
    la.oldest,
    -- Substitutions data (will be NULL if no data was recorded)
    sa.subs_made,
    sa.avg_sub_age,
    -- Goals For (AIK's score)
    CASE
        WHEN f."homeTeamId" = 994 THEN f."homeTeamScore"
        WHEN f."awayTeamId" = 994 THEN f."awayTeamScore"
        ELSE 0
    END AS goals_for,
    -- Goals Against (Opponent's score)
    CASE
        WHEN f."homeTeamId" = 994 THEN f."awayTeamScore"
        WHEN f."awayTeamId" = 994 THEN f."homeTeamScore"
        ELSE 0
    END AS goals_against,
    -- Define the period relative to the coach's arrival
    CASE
        WHEN f."date" < (SELECT coach_arrival FROM params) THEN 'Before Coach'
        ELSE 'After Coach'
    END AS period
FROM lineup_agg la
JOIN "fixtures" f ON la."eventId" = f."eventId"
LEFT JOIN subs_agg sa ON la."eventId" = sa."eventId" -- LEFT JOIN as subs are not guaranteed
ORDER BY f."date";


-- -------------------------------------------------------------------------
-- ANALYSIS VIEW 2: All Team Match Age and Performance
--
-- Rationale: Provides a comprehensive match-level dataset across all Allsvenskan
-- teams to assess league-wide trends and correlations between starting XI age
-- and performance metrics (goals, goals conceded) without being limited to AIK.
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW allsvenskan_team_match_data AS
-- 1. Lineup data with player ages (only starters)
lineup_with_age AS (
    SELECT
        l."eventId",
        l."teamId",
        EXTRACT(YEAR FROM AGE(f."date", p."dateOfBirth")) AS player_age,
        f."date" AS match_date
    FROM "lineup" l
    JOIN "players" p ON l."athleteId" = p."athleteId"
    JOIN "fixtures" f ON l."eventId" = f."eventId"
    WHERE l."starter" = TRUE -- Only starters
),

-- 2. Lineup metrics aggregated per team per match (only starters)
lineup_agg AS (
    SELECT
        "eventId",
        "teamId",
        AVG(player_age) AS avg_age,
        MIN(player_age) AS youngest,
        MAX(player_age) AS oldest
    FROM lineup_with_age
    GROUP BY "eventId", "teamId"
),

-- 3. Match results, restructured to be team-centric
match_results AS (
    SELECT
        la."eventId",
        la."teamId",
        f."date" AS match_date,
        la.avg_age,
        la.youngest,
        la.oldest,
        -- Goals For (Score from the perspective of la."teamId")
        CASE
            WHEN f."homeTeamId" = la."teamId" THEN f."homeTeamScore"
            WHEN f."awayTeamId" = la."teamId" THEN f."awayTeamScore"
            ELSE NULL
        END AS goals_for,
        -- Goals Against (Opponent's score)
        CASE
            WHEN f."homeTeamId" = la."teamId" THEN f."awayTeamScore"
            WHEN f."awayTeamId" = la."teamId" THEN f."homeTeamScore"
            ELSE NULL
        END AS goals_against
    FROM lineup_agg la
    JOIN "fixtures" f ON la."eventId" = f."eventId"
)

-- Final query
SELECT
    "eventId",
    "teamId",
    match_date,
    avg_age,
    youngest,
    oldest,
    goals_for,
    goals_against
FROM match_results
ORDER BY match_date, "teamId";