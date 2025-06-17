# Election Data Import Guide

## Overview
This guide explains how to import real county-level election data into the Akashic Intelligence Campaign Console.

## Data Requirements

### 1. Election Results Data
You need a CSV file with county-level election results. The system supports two formats:

#### Option A: Long Format (Recommended)
```csv
county_fips,county_name,state_abbr,state_name,year,democratic_votes,republican_votes,other_votes,total_votes
17031,Cook County,IL,Illinois,2020,1725891,738227,45987,2510105
17031,Cook County,IL,Illinois,2024,1650234,801456,52310,2504000
06037,Los Angeles County,CA,California,2020,3028885,1145530,88989,4263404
```

#### Option B: Wide Format
```csv
county_fips,county_name,state_abbr,state_name,1892_D,1892_R,1892_O,1892_T,1896_D,1896_R,...,2024_D,2024_R,2024_O,2024_T
17031,Cook County,IL,Illinois,45234,67890,1234,114358,...,1650234,801456,52310,2504000
```

### 2. County Boundaries (Optional)
GeoJSON file with county boundary polygons:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "GEOID": "17031",
        "NAME": "Cook County",
        "STATE": "IL"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-87.6298, 41.8781], ...]]
      }
    }
  ]
}
```

### 3. Demographics Data (Optional)
```csv
county_fips,year,population,median_age,median_household_income,poverty_rate,unemployment_rate,college_degree_rate,white_percentage,black_percentage,hispanic_percentage,asian_percentage,population_density,urban_percentage,voter_turnout_rate
17031,2020,5150233,37.4,68886,13.1,4.7,39.8,43.9,23.6,25.8,7.3,5495.1,99.7,72.4
```

## Import Process

### Step 1: Prepare Your Data
1. Create a data directory:
   ```bash
   mkdir -p data/elections
   ```

2. Place your files in the directory:
   ```
   data/elections/
   ├── county_election_results.csv    (required)
   ├── county_boundaries.geojson      (optional)
   └── county_demographics.csv        (optional)
   ```

### Step 2: Run the Import Script
```bash
# Set the data directory (optional, defaults to ./data/elections)
export ELECTION_DATA_DIR=./data/elections

# Run the import
npx tsx scripts/import-election-data.ts
```

### Step 3: Verify Import
Check the console output for:
- Number of counties imported
- Any errors encountered
- Total election years processed

## Data Sources

### Recommended Sources:
1. **MIT Election Lab**: County-level presidential returns 1892-2020
   - https://electionlab.mit.edu/data

2. **Census Bureau**: County demographics and boundaries
   - https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html
   - American Community Survey (ACS) 5-year estimates

3. **Dave Leip's Atlas**: Historical election data
   - https://uselectionatlas.org/

4. **Harvard Dataverse**: County Presidential Election Returns
   - https://dataverse.harvard.edu/

## Handling Missing Data

The system gracefully handles missing data:
- Mississippi counties: No data for 1904, 1908
- Texas counties: No data for 1892-1908
- Alaska/Hawaii: No data before statehood

## Troubleshooting

### Common Issues:

1. **FIPS Code Format**
   - Ensure FIPS codes are 5 digits (pad with zeros if needed)
   - Example: "7031" should be "07031"

2. **Column Name Variations**
   The import script handles common variations:
   - `county_fips`, `FIPS`, `fips_code`
   - `democratic_votes`, `dem_votes`, `D`
   - `republican_votes`, `rep_votes`, `R`

3. **Memory Issues**
   For very large datasets, consider:
   - Splitting by state or year
   - Increasing Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096" npx tsx scripts/import-election-data.ts`

## Data Validation

After import, verify your data:

1. Check a known county:
   ```bash
   # Visit http://localhost:3000/mapping/county/17031
   # (Cook County, IL)
   ```

2. Test swing analysis:
   ```bash
   # Visit http://localhost:3000/mapping
   # Select 2016 → 2020 comparison
   ```

3. Review database counts:
   ```sql
   -- In Prisma Studio (npm run prisma:studio)
   SELECT COUNT(*) FROM "County";
   SELECT COUNT(*) FROM "CountyElectionResult";
   ```

## Performance Notes

- Import processes ~3,000 counties in 2-3 minutes
- Each county stores all election years as JSON
- Redis caching improves query performance
- Consider running import during off-hours for production

## Questions?

Contact the development team or check the logs at:
- Import logs: Console output
- Error details: Check for specific FIPS codes mentioned
- Database state: Use Prisma Studio (`npm run prisma:studio`)