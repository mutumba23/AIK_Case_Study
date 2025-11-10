-- =========================================================================
-- FILE: cleaning_validation.sql
-- DESCRIPTION: Contains SQL queries used to validate and perform final data
-- integrity checks after CSV files are imported into PostgreSQL.
-- These checks ensure Foreign Key integrity and data completeness.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. DATA COMPLETENESS CHECK: IDENTIFYING MISSING PLAYERS
--
-- Rationale: Key event data often contains player IDs that were not present
-- in the primary 'Players' dimension table, likely due to an incomplete
-- initial data pull. This query identifies those orphaned athlete IDs.
-- The results of this query led to the manual extraction of these
-- players via the 'step_7_extract_missing_players' function in the ETL script.
-- -------------------------------------------------------------------------
SELECT DISTINCT
    ke."athleteId"
FROM
    "keyevents" ke
WHERE
    ke."athleteId" IS NOT NULL
    AND ke."athleteId" NOT IN (
        SELECT "athleteId" FROM "players"
    );

-- -------------------------------------------------------------------------
-- 2. DATA QUALITY CHECK: CHECKING FOR DUPLICATE MATCH STATS
--
-- Rationale: The Lineup and PlayerStats tables are expected to have a
-- unique combination of athleteId and eventId (match). This query checks
-- for potential duplicates that could skew per-match analysis.
-- -------------------------------------------------------------------------
SELECT
    "athleteId",
    "eventId",
    COUNT(*) AS "record_count"
FROM
    "playerstats"
GROUP BY
    "athleteId",
    "eventId"
HAVING
    COUNT(*) > 1;

-- -------------------------------------------------------------------------
-- 3. REFERENTIAL INTEGRITY CHECK: ORPHANED TEAM STATS
--
-- Rationale: Ensure all records in TeamStats relate to a valid match (eventId)
-- and a valid team (teamId) in their respective dimension tables.
-- This query checks for eventIds in TeamStats that do not exist in Fixtures.
-- (This validation is often redundant if Foreign Keys are correctly applied,
-- but it confirms integrity before FK constraints are enforced).
-- -------------------------------------------------------------------------
SELECT DISTINCT
    ts."eventId"
FROM
    "teamstats" ts
LEFT JOIN
    "fixtures" f ON ts."eventId" = f."eventId"
WHERE
    f."eventId" IS NULL
LIMIT 10; -- Limiting to 10 for quick inspection

-- -------------------------------------------------------------------------
-- 4. LOGICAL CONSISTENCY CHECK: PLAYER AGE AND BIRTH DATE
--
-- Rationale: Checks for potential illogical data entries, such as players
-- recorded with a birth date in the future or a calculated age that is
-- unrealistically low or high for a professional athlete.
-- (Assumes 'year' column exists in Standings/Fixtures to determine data capture year)
-- -------------------------------------------------------------------------
SELECT
    "athleteId",
    "fullName",
    "dateOfBirth",
    "age"
FROM
    "players"
WHERE
    "age" < 15 OR "age" > 45
ORDER BY "age" DESC;

-- -------------------------------------------------------------------------
-- 5. DATA LIMITATION CHECK: SUBSTITUTE DATA COMPLETENESS
--
-- Rationale: Assesses the reliability of substitution data by checking how
-- many matches (Fixtures) have associated Lineup records indicating a
-- substitution (player coming in or going out during the game).
--
-- Finding: Many fixtures showed incomplete or missing substitution records.
-- Decision: Due to this data sparsity, detailed analysis based on
-- in-game substitutions (e.g., impact of late-game subs, average sub age, etc.)
-- was excluded from the final analysis to maintain data validity.
-- -------------------------------------------------------------------------
WITH TotalFixtures AS (
    SELECT COUNT("eventId") AS total_matches
    FROM "fixtures"
),
FixturesWithSubsData AS (
    SELECT DISTINCT
        L."eventId"
    FROM
        "lineup" L
    WHERE
        -- Player subbed in (inMinute > 0) OR player subbed out (outMinute < 90)
        L."inMinute" > 0 OR (L."outMinute" IS NOT NULL AND L."outMinute" < 90)
)
SELECT
    (SELECT COUNT(*) FROM FixturesWithSubsData) AS matches_with_sub_data,
    (SELECT total_matches FROM TotalFixtures) AS total_matches,
    ROUND(
        (SELECT COUNT(*) FROM FixturesWithSubsData) * 100.0 / (SELECT total_matches FROM TotalFixtures),
        2
    ) AS percent_of_matches_with_sub_data;

-- -------------------------------------------------------------------------
-- 6. SCOPE LIMITATION CHECK: HIGH-PRESSURE/DOMINANT PLAYSTYLE ANALYSIS
--
-- Rationale: The initial project goal included analyzing the correlation
-- between team age and high-pressure or dominant playstyles (coach's motto).
-- This check assesses the richness of the available data (TeamStats) for
-- these complex tactical metrics.
--
-- Finding: While metrics like 'possessionPct', 'foulsCommitted', and 'redCards'
-- exist, detailed, high-resolution tactical metrics (e.g., pressed passes,
-- high turnovers, territory gained) required to truly quantify "high-pressure"
-- or "dominant" play were missing.
-- Decision: The analysis scope was limited to reliable metrics like team
-- age, goals, shots, and basic team stats, excluding the correlation to
-- complex tactical style due to data deficiency.
-- -------------------------------------------------------------------------
SELECT
    AVG("possessionPct") AS "avg_possession",
    AVG("foulsCommitted") AS "avg_fouls_committed",
    SUM("redCards") AS "total_red_cards",
    MIN("passPct") AS "min_pass_pct",
    MAX("tacklePct") AS "max_tackle_pct",
    COUNT(DISTINCT "eventId") AS "total_matches_with_stats"
FROM
    "teamstats";