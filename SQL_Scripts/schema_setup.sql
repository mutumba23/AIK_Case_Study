-- =========================================================================
-- FILE: schema_setup.sql
-- DESCRIPTION: Defines the PostgreSQL database schema for the AIK Case Study.
-- This script creates the necessary tables, primary keys, and foreign keys
-- to structure the cleaned Allsvenskan data imported from CSV files.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. DROP EXISTING TABLES
-- Used to ensure a clean slate if the schema is run multiple times.
-- Dropped in reverse dependency order.
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS "playerstats" CASCADE;
DROP TABLE IF EXISTS "keyevents" CASCADE;
DROP TABLE IF EXISTS "lineup" CASCADE;
DROP TABLE IF EXISTS "fixtures" CASCADE;
DROP TABLE IF EXISTS "standings" CASCADE;
DROP TABLE IF EXISTS "teamstats" CASCADE;
DROP TABLE IF EXISTS "teams" CASCADE;
DROP TABLE IF EXISTS "players" CASCADE;
DROP TABLE IF EXISTS "leagues" CASCADE;


-- -------------------------------------------------------------------------
-- 2. CORE DIMENSION TABLES (Independent)
-- These tables define entities like leagues, teams, and players.
-- -------------------------------------------------------------------------

-- Table: Leagues (from leagues_allsvenskan_2024_2025.csv)
CREATE TABLE "leagues" (
    "seasonType" INT NOT NULL,
    "year" INT,
    "seasonName" VARCHAR(255),
    "seasonSlug" VARCHAR(255),
    "leagueId" INT PRIMARY KEY,
    "midsizeName" VARCHAR(255),
    "leagueName" VARCHAR(255),
    "leagueShortName" VARCHAR(50)
);

-- Table: Teams (from teams_allsvenskan_2024_2025.csv)
CREATE TABLE "teams" (
    "teamId" INT PRIMARY KEY,
    "location" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "abbreviation" VARCHAR(10),
    "displayName" VARCHAR(255),
    "shortDisplayName" VARCHAR(255),
    "color" VARCHAR(10),
    "alternateColor" VARCHAR(10),
    "logoURL" TEXT,
    "venueId" INT,
    "slug" VARCHAR(255)
);

-- Table: Players (from players_allsvenskan_2024_2025.csv AND players_missing.csv)
CREATE TABLE "players" (
    "athleteId" INT PRIMARY KEY,
    "firstName" VARCHAR(255),
    "middleName" VARCHAR(255),
    "lastName" VARCHAR(255),
    "fullName" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(255),
    "shortName" VARCHAR(255),
    "nickName" VARCHAR(255),
    "slug" VARCHAR(255),
    "displayWeight" VARCHAR(50),
    "weight" FLOAT,
    "displayHeight" VARCHAR(50),
    "height" FLOAT,
    "age" FLOAT,
    "dateOfBirth" TIMESTAMP WITH TIME ZONE,
    "gender" VARCHAR(10),
    "jersey" FLOAT,
    "citizenship" VARCHAR(255),
    "birthPlaceCountry" VARCHAR(255),
    "positionName" VARCHAR(50),
    "positionId" FLOAT,
    "positionAbbreviation" VARCHAR(10),
    "headshotUrl" TEXT,
    "headshot_alt" TEXT,
    "timestamp" TIMESTAMP WITH TIME ZONE
);


-- -------------------------------------------------------------------------
-- 3. INTERMEDIATE FACT/DIMENSION TABLES (Dependent on CORE)
-- -------------------------------------------------------------------------

-- Table: Fixtures (Match Information) (from fixtures_allsvenskan_2024_2025.csv)
CREATE TABLE "fixtures" (
    "Rn" INT,
    "seasonType" INT,
    "leagueId" INT REFERENCES "Leagues"("leagueId"), -- FK to Leagues
    "eventId" INT PRIMARY KEY,
    "date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "venueId" INT,
    "attendance" INT,
    "homeTeamId" INT REFERENCES "Teams"("teamId"),  -- FK to Teams
    "awayTeamId" INT REFERENCES "Teams"("teamId"),  -- FK to Teams
    "homeTeamWinner" BOOLEAN,
    "awayTeamWinner" BOOLEAN,
    "homeTeamScore" INT,
    "awayTeamScore" INT,
    "homeTeamShootoutScore" INT,
    "awayTeamShootoutScore" INT,
    "statusId" INT,
    "updateTime" TIMESTAMP WITH TIME ZONE
);

-- Table: Standings (from standings_allsvenskan_2024_2025.csv)
CREATE TABLE "standings" (
    "teamRank" INT,
    "teamId" INT REFERENCES "Teams"("teamId"), -- FK to Teams
    "gamesPlayed" INT,
    "wins" INT,
    "ties" INT,
    "losses" INT,
    "points" INT,
    "gf" FLOAT,
    "ga" FLOAT,
    "gd" INT,
    "deductions" INT,
    "clean_sheet" FLOAT,
    "form" VARCHAR(20),
    -- Additional columns from your Standings file, mapping your cleaned CSV names
    "seasonType" INT,
    "year" INT,
    "league" VARCHAR(255),
    "appearances_value" FLOAT,
    "subIns_value" FLOAT,
    "foulsCommitted_value" FLOAT,
    "foulsSuffered_value" FLOAT,
    "yellowCards_value" FLOAT,
    "redCards_value" FLOAT,
    "ownGoals_value" FLOAT,
    "goalAssists_value" FLOAT,
    "offsides_value" FLOAT,
    "shotsOnTarget_value" FLOAT,
    "totalShots_value" FLOAT,
    "totalGoals_value" FLOAT,
    "shotsFaced_value" FLOAT,
    "saves_value" FLOAT,
    "goalsConceded_value" FLOAT,
    "timestamp" TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY ("teamId", "seasonType") -- Composite Key
);

-- Table: TeamStats (from teamStats_allsvenskan_2024_2025.csv)
CREATE TABLE "teamstats" (
    "seasonType" INT,
    "eventId" INT REFERENCES "Fixtures"("eventId"), -- FK to Fixtures
    "teamId" INT REFERENCES "Teams"("teamId"),     -- FK to Teams
    "teamOrder" INT,
    "possessionPct" FLOAT,
    "foulsCommitted" FLOAT,
    "yellowCards" FLOAT,
    "redCards" FLOAT,
    "offsides" FLOAT,
    "wonCorners" FLOAT,
    "saves" FLOAT,
    "totalShots" FLOAT,
    "shotsOnTarget" FLOAT,
    "shotPct" FLOAT,
    "penaltyKickGoals" FLOAT,
    "penaltyKickShots" FLOAT,
    "accuratePasses" FLOAT,
    "totalPasses" FLOAT,
    "passPct" FLOAT,
    "accurateCrosses" FLOAT,
    "totalCrosses" FLOAT,
    "crossPct" FLOAT,
    "totalLongBalls" FLOAT,
    "accurateLongBalls" FLOAT,
    "longballPct" FLOAT,
    "blockedShots" FLOAT,
    "effectiveTackles" FLOAT,
    "totalTackles" FLOAT,
    "tacklePct" FLOAT,
    "interceptions" FLOAT,
    "effectiveClearance" FLOAT,
    "totalClearance" FLOAT,
    "updateTime" TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY ("eventId", "teamId") -- Composite Key
);


-- -------------------------------------------------------------------------
-- 4. FACT TABLES (Granular Match Details)
-- These tables contain detailed, per-match, and per-player statistics.
-- -------------------------------------------------------------------------

-- Table: Lineup (from lineup_allsvenskan_2024_2025_merged.csv)
CREATE TABLE "lineup" (
    "athleteId" INT REFERENCES "Players"("athleteId"), -- FK to Players
    "eventId" INT REFERENCES "Fixtures"("eventId"),    -- FK to Fixtures
    "teamId" INT REFERENCES "Teams"("teamId"),        -- FK to Teams
    "starter" BOOLEAN,
    "captain" BOOLEAN,
    "positionName" VARCHAR(50),
    "positionAbbreviation" VARCHAR(10),
    "jersey" FLOAT,
    "starter_home" BOOLEAN,
    "captain_home" BOOLEAN,
    "starter_away" BOOLEAN,
    "captain_away" BOOLEAN,
    "formationPlace" INT,
    "inMinute" FLOAT,
    "outMinute" FLOAT,
    "updateTime" TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY ("athleteId", "eventId") -- Composite Key
);

-- Table: PlayerStats (from playerStats_allsvenskan_2024_2025_merged.csv)
CREATE TABLE "playerStats" (
    "athleteId" INT REFERENCES "Players"("athleteId"), -- FK to Players
    "teamId" INT REFERENCES "Teams"("teamId"),        -- FK to Teams
    "eventId" INT REFERENCES "Fixtures"("eventId"),    -- FK to Fixtures
    "jersey" FLOAT,
    "starter" BOOLEAN,
    "positionId" FLOAT,
    "positionName" VARCHAR(50),
    "positionAbbreviation" VARCHAR(10),
    "inMinute" FLOAT,
    "outMinute" FLOAT,
    "minutes" FLOAT,
    "goals" FLOAT,
    "shots" FLOAT,
    "shotsOnTarget" FLOAT,
    "saves" FLOAT,
    "penaltyShots" FLOAT,
    "penaltyGoals" FLOAT,
    "freeKickGoals" FLOAT,
    "assists" FLOAT,
    "dispossessed" FLOAT,
    "offside" FLOAT,
    "foulCommitted" FLOAT,
    "foulSuffered" FLOAT,
    "yellowCards" FLOAT,
    "redCards" FLOAT,
    "updateTime" TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY ("athleteId", "eventId") -- Composite Key
);

-- Table: KeyEvents (from keyEvents_allsvenskan_2024_2025_merged.csv)
CREATE TABLE "keyEvents" (
    "id" BIGINT PRIMARY KEY,
    "eventId" INT REFERENCES "Fixtures"("eventId"), -- FK to Fixtures
    "teamId" INT REFERENCES "Teams"("teamId"),     -- FK to Teams
    "typeId" INT,
    "typeText" VARCHAR(255),
    "clock" FLOAT,
    "period" INT,
    "score" VARCHAR(10),
    "homeScore" INT,
    "awayScore" INT,
    "athleteId" INT REFERENCES "Players"("athleteId"), -- FK to Players
    "assistAthleteId" INT REFERENCES "Players"("athleteId"), -- FK to Players
    "detailId" INT,
    "detailText" VARCHAR(255),
    "updateTime" TIMESTAMP WITH TIME ZONE
);