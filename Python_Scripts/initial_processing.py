import pandas as pd
import os
import glob
from sys import exit

# --- Configuration ---
# Assuming the script runs from the AIK-Case-Study root directory
RAW_DATA_DIR = "espn_data"
BASE_DATA_DIR = os.path.join(RAW_DATA_DIR, "base_data")
OUTPUT_DIR = "Data"

# Ensure the output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Define the seasonType IDs for the Allsvenskan leagues (2024 and 2025)
ALLSVENSKAN_SEASON_TYPES = [12288, 13086]

print("--- Starting Initial Data Processing (ETL) ---")
print(f"Target Season Types: {ALLSVENSKAN_SEASON_TYPES}")
print("-" * 40)

# --- 1. FILTERING STEP A: Leagues (The Starting Point) ---
def step_1_filter_leagues():
    """Filters the leagues file to identify the target Allsvenskan leagues."""
    print("STEP 1/7: Filtering Leagues...")
    try:
        # Load all leagues
        leagues = pd.read_csv(os.path.join(BASE_DATA_DIR, "leagues.csv"))
        
        # Only keep the two Allsvenskan leagues
        allsvenskan_leagues = leagues[leagues["seasonType"].isin(ALLSVENSKAN_SEASON_TYPES)]
        
        output_path = os.path.join(OUTPUT_DIR, "leagues_allsvenskan_2024_2025.csv")
        allsvenskan_leagues.to_csv(output_path, index=False)
        
        print(f"Success: Filtered {len(allsvenskan_leagues)} leagues and saved to {output_path}")
        return allsvenskan_leagues
    except FileNotFoundError:
        print(f"FATAL ERROR: Required file leagues.csv not found in {BASE_DATA_DIR}. Check directory setup.")
        exit(1)

# --- 2. FILTERING STEP B: Fixtures (Requires Leagues) ---
def step_2_filter_fixtures(leagues_df):
    """Filters fixtures based on the league IDs present in the filtered leagues list."""
    print("STEP 2/7: Filtering Fixtures...")
    try:
        # Load full fixtures CSV
        df_fixtures = pd.read_csv(os.path.join(BASE_DATA_DIR, "fixtures.csv"))
        
        # Filter fixtures using the leagueId present in the filtered leagues dataframe
        filtered_fixtures = df_fixtures.merge(
            leagues_df[['leagueId']], 
            on='leagueId', 
            how='inner'
        )
        
        output_path = os.path.join(OUTPUT_DIR, "fixtures_allsvenskan_2024_2025.csv")
        filtered_fixtures.to_csv(output_path, index=False)
        
        print(f"Success: Filtered {len(filtered_fixtures)} fixtures and saved to {output_path}")
        return filtered_fixtures
    except FileNotFoundError:
        print(f"FATAL ERROR: Required file fixtures.csv not found in {BASE_DATA_DIR}. Check directory setup.")
        exit(1)

# --- 3. FILTERING STEP C: Teams (Requires Fixtures) ---
def step_3_filter_teams(fixtures_df):
    """Filters teams based on unique team IDs found in the filtered fixtures."""
    print("STEP 3/7: Filtering Teams...")
    try:
        # Extract all unique teamIds from home and away teams
        team_ids = pd.unique(fixtures_df[["homeTeamId", "awayTeamId"]].values.ravel())
        
        # Load full teams CSV
        df_teams = pd.read_csv(os.path.join(BASE_DATA_DIR, "teams.csv"))
        
        # Keep only teams that played in Allsvenskan
        df_teams_swe = df_teams[df_teams["teamId"].isin(team_ids)]
        
        output_path = os.path.join(OUTPUT_DIR, "teams_allsvenskan_2024_2025.csv")
        df_teams_swe.to_csv(output_path, index=False)
        
        print(f"Success: Filtered {len(df_teams_swe)} teams and saved to {output_path}")
        return df_teams_swe
    except FileNotFoundError:
        print(f"FATAL ERROR: Required file teams.csv not found in {BASE_DATA_DIR}. Check directory setup.")
        exit(1)

# --- 4. FILTERING STEP D: Players (Requires Merged Player Stats) ---
# This is dependent on the Merging step for PlayerStats, so we define merge first.

def merge_annual_data(base_filename, input_dir, output_dir):
    """Loads and concatenates 2024 and 2025 files for a given dataset."""
    
    # Use glob to find files matching the pattern (e.g., 'playerStats_2024_SWE.1.csv')
    file_pattern = os.path.join(input_dir, f"{base_filename}_*_SWE.1.csv")
    input_files = glob.glob(file_pattern)

    if not input_files:
        print(f"Skipping merge for {base_filename}: No annual files found in {input_dir}.")
        return None

    # Load all found annual files
    list_dfs = [pd.read_csv(f) for f in input_files]
    
    # Concatenate the dataframes
    merged_df = pd.concat(list_dfs, ignore_index=True)
    
    # Save the final merged file
    output_filename = f"{base_filename}_allsvenskan_2024_2025_merged.csv"
    output_path = os.path.join(output_dir, output_filename)
    merged_df.to_csv(output_path, index=False)
    
    print(f"Success: Merged {len(list_dfs)} files for {base_filename}. Saved to {output_path}")
    return merged_df

def step_4_filter_players():
    """Filters players based on athleteIds found in the merged playerStats data."""
    print("STEP 4/7: Filtering Players...")
    try:
        # Merge player stats first to get a list of all involved athletes
        merged_player_stats = merge_annual_data("playerStats", os.path.join(RAW_DATA_DIR, "playerStats_data"), OUTPUT_DIR)
        
        if merged_player_stats is None:
            print("Skipping Player filtering: Could not merge playerStats.")
            return

        # Extract unique athleteIds
        allsvenskan_athlete_ids = merged_player_stats["athleteId"].unique()
        
        # Load full players CSV (Note: This file is often found directly in the BASE_DATA_DIR or root)
        # Assuming players.csv is in the BASE_DATA_DIR for consistency
        players = pd.read_csv(os.path.join(BASE_DATA_DIR, "players.csv")) 
        
        # Filter players to only include Allsvenskan athletes
        players_swe = players[players["athleteId"].isin(allsvenskan_athlete_ids)]
        
        output_path = os.path.join(OUTPUT_DIR, "players_allsvenskan_2024_2025.csv")
        players_swe.to_csv(output_path, index=False)
        
        print(f"Success: Filtered {len(players_swe)} players and saved to {output_path}")
        return players_swe
    except FileNotFoundError:
        # Added a specific fallback check for players.csv location
        print(f"ERROR: Could not find players.csv in {BASE_DATA_DIR}. Check path and structure.")
        exit(1)

# --- 5. FILTERING STEP E: Standings & Team Stats (Requires Teams) ---
def step_5_filter_by_teams(teams_df):
    """Filters Standings and TeamStats based on the team IDs that played in Allsvenskan."""
    print("STEP 5/7: Filtering Standings and TeamStats...")
    
    allsvenskan_team_ids = teams_df["teamId"].unique()

    # --- 5a. Filter Standings ---
    try:
        standings = pd.read_csv(os.path.join(BASE_DATA_DIR, "standings.csv"))
        standings_swe = standings[standings["teamId"].isin(allsvenskan_team_ids)]
        
        # Optional: Keep only relevant columns (as per your original script)
        # NOTE: I am commenting out the selective column drop to avoid errors if columns names changed.
        # standings_swe = standings_swe[...] 

        output_path_standings = os.path.join(OUTPUT_DIR, "standings_allsvenskan_2024_2025.csv")
        standings_swe.to_csv(output_path_standings, index=False)
        print(f"Success: Filtered standings for {len(allsvenskan_team_ids)} teams. Saved to {output_path_standings}")
    except FileNotFoundError:
        print(f"ERROR: standings.csv not found in {BASE_DATA_DIR}. Skipping Standings filter.")

    # --- 5b. Filter Team Stats ---
    try:
        team_stats = pd.read_csv(os.path.join(BASE_DATA_DIR, "teamStats.csv"))
        team_stats_swe = team_stats[team_stats["teamId"].isin(allsvenskan_team_ids)]
        
        output_path_teamstats = os.path.join(OUTPUT_DIR, "teamStats_allsvenskan_2024_2025.csv")
        team_stats_swe.to_csv(output_path_teamstats, index=False)
        print(f"Success: Filtered teamStats saved — {len(team_stats_swe)} rows.")
    except FileNotFoundError:
        print(f"ERROR: teamStats.csv not found in {BASE_DATA_DIR}. Skipping TeamStats filter.")

# --- 6. MERGING STEP (Remaining Annual Files) ---
def step_6_merge_remaining():
    """Merges remaining annual files (Lineup, KeyEvents, Plays) not filtered earlier."""
    print("STEP 6/7: Merging remaining annual data (Lineup, KeyEvents, Plays)...")
    
    # Lineup Data
    merge_annual_data("lineup", os.path.join(RAW_DATA_DIR, "lineup_data"), OUTPUT_DIR)
    
    # Key Events
    merge_annual_data("keyEvents", os.path.join(RAW_DATA_DIR, "keyEvents_data"), OUTPUT_DIR)
    
    # Plays Data
    merge_annual_data("plays", os.path.join(RAW_DATA_DIR, "plays_data"), OUTPUT_DIR)

# --- 7. CLEANING STEP (Extract Missing Players) ---
def step_7_extract_missing_players():
    """Extracts players identified as missing by the SQL validation query."""
    print("STEP 7/7: Extracting missing player data...")
    try:
        # Load the full players CSV
        players = pd.read_csv(os.path.join(BASE_DATA_DIR, "players.csv"))

        # List of missing athleteIds found via external SQL query
        missing_ids = [
            359774, 300865, 302826, 372889, 235607, 255807, 301822,
            294188, 283408, 340897, 198297, 75066, 392191, 363770,
            203569, 297422, 192936
        ]

        # Filter rows
        missing_players = players[players["athleteId"].isin(missing_ids)]

        # Save to a new CSV in the Data folder
        output_path = os.path.join(OUTPUT_DIR, "players_missing.csv")
        missing_players.to_csv(output_path, index=False)

        print(f"Success: Saved {len(missing_players)} missing players to {output_path}")
    except FileNotFoundError:
        print(f"ERROR: Could not find players.csv in {BASE_DATA_DIR}. Skipping missing player extraction.")
        
# --- EXECUTION ---

# 1. Filter Leagues
leagues_allsvenskan_df = step_1_filter_leagues()

# 2. Filter Fixtures (Requires League Filter Result)
fixtures_allsvenskan_df = step_2_filter_fixtures(leagues_allsvenskan_df)

# 3. Filter Teams (Requires Fixtures Filter Result)
teams_allsvenskan_df = step_3_filter_teams(fixtures_allsvenskan_df)

# 4. Filter Players (Requires merging player stats first)
step_4_filter_players()

# 5. Filter Standings and TeamStats (Requires Teams Filter Result)
step_5_filter_by_teams(teams_allsvenskan_df)

# 6. Merge Remaining Annual Files
step_6_merge_remaining()

# 7. Extract Missing Players (Validation Step)
step_7_extract_missing_players()

print("-" * 40)
print("--- Data Processing Complete ---")