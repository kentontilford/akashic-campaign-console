# Data Migration & Import Guide
## Akashic Intelligence Campaign Console

### Overview

This guide provides comprehensive instructions for migrating data from existing campaign management systems and importing various data sources into the Akashic Intelligence Campaign Console.

## Table of Contents

1. [Pre-Migration Assessment](#pre-migration-assessment)
2. [Supported Data Sources](#supported-data-sources)
3. [Voter File Import](#voter-file-import)
4. [CRM Data Migration](#crm-data-migration)
5. [Financial Data Import](#financial-data-import)
6. [Historical Election Data](#historical-election-data)
7. [Data Validation & Quality Assurance](#data-validation--quality-assurance)
8. [Migration Timeline & Checklist](#migration-timeline--checklist)
9. [Troubleshooting](#troubleshooting)
10. [Post-Migration Verification](#post-migration-verification)

---

## Pre-Migration Assessment

### Data Audit Checklist

Before beginning migration, complete this assessment:

**Voter Data:**
- [ ] Current voter file format (CSV, Excel, VAN export, etc.)
- [ ] Total number of voter records
- [ ] Available data fields (name, address, phone, email, voting history, etc.)
- [ ] Data quality assessment (completeness, accuracy, duplicates)
- [ ] Last update date of voter file

**Contact & Volunteer Data:**
- [ ] Current CRM system in use
- [ ] Number of volunteer/donor records
- [ ] Available contact methods and preferences
- [ ] Interaction history and engagement levels
- [ ] Custom fields and tags in current system

**Financial Data:**
- [ ] Current fundraising platform(s)
- [ ] Contribution history format
- [ ] Expense tracking system
- [ ] FEC filing status and compliance records

**Historical Data:**
- [ ] Previous campaign election results
- [ ] County-level historical data availability
- [ ] Demographic and census data access

### System Compatibility Matrix

| Current System | Migration Method | Estimated Time | Complexity |
|---------------|-----------------|---------------|------------|
| VAN/NGP | Direct API sync | 2-4 hours | Low |
| NationBuilder | CSV export/import | 4-8 hours | Medium |
| ActBlue | API integration | 1-2 hours | Low |
| Custom Database | Manual mapping | 8-16 hours | High |
| Excel/Google Sheets | Template conversion | 2-6 hours | Medium |

---

## Supported Data Sources

### Primary Data Sources

#### 1. Voter Files
```
Supported Formats:
- VAN exports (.csv, .txt)
- L2 Political data files
- Catalist voter files
- State voter registration files
- Custom CSV formats

Required Fields:
- voter_id (unique identifier)
- first_name, last_name
- address (street, city, state, zip)
- registration_status
- party_affiliation (if available)

Optional Fields:
- phone, email
- date_of_birth
- voting_history
- demographic_data
```

#### 2. Contact/CRM Data
```
Supported Systems:
- NationBuilder (API + Export)
- Salesforce (API integration)
- Mailchimp (API sync)
- Action Network
- Google Contacts
- Custom CSV/Excel files

Required Fields:
- contact_id
- email OR phone
- contact_type (volunteer, donor, supporter)

Optional Fields:
- engagement_score
- volunteer_roles
- donation_history
- communication_preferences
```

#### 3. Financial Data
```
Supported Platforms:
- ActBlue (API integration)
- WinRed (for opposition research)
- Square (event payments)
- PayPal (small donations)
- Bank statements (CSV)
- FEC filing data

Required Fields:
- transaction_id
- amount
- date
- contributor_name
- contributor_address

Optional Fields:
- employer_occupation
- contribution_source
- event_code
```

---

## Voter File Import

### Step 1: Data Preparation

1. **Download Current Voter File**
   ```bash
   # Example VAN export process
   1. Log into VAN
   2. Navigate to "My Voters" → "Export"
   3. Select all required fields
   4. Choose CSV format
   5. Download file
   ```

2. **Data Cleaning Checklist**
   - [ ] Remove duplicate records
   - [ ] Standardize address formats
   - [ ] Validate phone number formats
   - [ ] Clean email addresses
   - [ ] Verify ZIP codes

3. **Field Mapping Template**
   ```csv
   Source Field,Akashic Field,Data Type,Required
   VANID,voter_id,string,yes
   FirstName,first_name,string,yes
   LastName,last_name,string,yes
   RegAddress,street_address,string,yes
   RegCity,city,string,yes
   RegState,state,string,yes
   RegZip5,zip_code,string,yes
   Phone,phone,string,no
   Email,email,string,no
   Party,party_affiliation,string,no
   ```

### Step 2: Import Process

1. **Access Import Tool**
   - Navigate to Campaign → Data → Import
   - Select "Voter File Import"
   - Choose import method (file upload or API sync)

2. **File Upload Process**
   ```
   1. Click "Upload Voter File"
   2. Select prepared CSV file
   3. Map fields using interface
   4. Set import options:
      - Overwrite existing records: Yes/No
      - Create new voters only: Yes/No
      - Update missing fields only: Yes/No
   5. Run validation check
   6. Review validation report
   7. Confirm import
   ```

3. **Validation Rules**
   - Duplicate detection (based on name + address)
   - Address validation using USPS API
   - Phone number format validation
   - Email format validation
   - ZIP code verification

### Step 3: Post-Import Processing

1. **Automatic AI Enhancement**
   - Turnout score calculation
   - Persuasion score assignment
   - Political typology mapping
   - American Nations region assignment

2. **Data Quality Report**
   ```
   Import Summary:
   - Total records processed: 25,847
   - Successfully imported: 25,234
   - Duplicates found: 445
   - Invalid addresses: 123
   - Missing required fields: 45
   
   AI Enhancement Status:
   - Turnout scores assigned: 25,234 (100%)
   - Persuasion scores assigned: 25,234 (100%)
   - Political typologies mapped: 24,891 (98.6%)
   - Geographic regions assigned: 25,234 (100%)
   ```

---

## CRM Data Migration

### NationBuilder Migration

1. **Pre-Migration Setup**
   ```bash
   # API credentials required
   - Nation slug
   - API token
   - OAuth credentials (if applicable)
   ```

2. **Data Export Process**
   ```
   1. Log into NationBuilder
   2. Navigate to "People" → "Download people"
   3. Select all people or filtered list
   4. Choose fields to include:
      - Basic info (name, email, phone)
      - Addresses
      - Tags and notes
      - Custom fields
      - Donation history
      - Volunteer history
   5. Download CSV file
   ```

3. **Field Mapping**
   ```csv
   NationBuilder Field,Akashic Field,Notes
   id,nb_person_id,Keep for reference
   first_name,first_name,
   last_name,last_name,
   email,email,Primary contact method
   phone,phone,Format as (XXX) XXX-XXXX
   primary_address,street_address,
   city,city,
   state,state,Use 2-letter code
   zip,zip_code,
   tags,contact_tags,Comma-separated
   total_donated_cents,lifetime_donated,Convert to dollars
   ```

### Salesforce Migration

1. **Data Export**
   ```
   1. Log into Salesforce
   2. Setup → Data Export
   3. Select "Export Now" or schedule
   4. Choose objects: Contacts, Leads, Opportunities
   5. Select all fields or customize
   6. Download when ready
   ```

2. **Contact Processing**
   ```sql
   -- Example transformation queries
   SELECT 
     Id as sf_contact_id,
     FirstName as first_name,
     LastName as last_name,
     Email as email,
     Phone as phone,
     MailingStreet as street_address,
     MailingCity as city,
     MailingState as state,
     MailingPostalCode as zip_code,
     Description as notes,
     CreatedDate as created_at
   FROM Contact
   WHERE IsDeleted = false
   ```

---

## Financial Data Import

### ActBlue Integration

1. **API Setup**
   ```javascript
   // Configuration
   const actblueConfig = {
     apiKey: process.env.ACTBLUE_API_KEY,
     baseUrl: 'https://secure.actblue.com/api/v1',
     campaignId: 'your-campaign-id'
   }
   
   // Sync contributions
   async function syncActBlueContributions() {
     const contributions = await fetch(
       `${actblueConfig.baseUrl}/contributions?campaign=${actblueConfig.campaignId}`,
       {
         headers: {
           'Authorization': `Bearer ${actblueConfig.apiKey}`,
           'Content-Type': 'application/json'
         }
       }
     )
     
     return contributions.json()
   }
   ```

2. **Data Mapping**
   ```csv
   ActBlue Field,Akashic Field,Transformation
   contribution_id,actblue_id,Direct mapping
   amount,amount_cents,Convert to cents
   created_at,contributed_at,ISO date format
   donor_firstname,first_name,
   donor_lastname,last_name,
   donor_addr1,street_address,
   donor_city,city,
   donor_state,state,
   donor_zip,zip_code,
   donor_employer,employer,
   donor_occupation,occupation,
   ```

### Bank Statement Processing

1. **CSV Format Requirements**
   ```csv
   Date,Description,Amount,Type,Reference
   2024-01-15,"Campaign Contribution - John Doe",500.00,Credit,CHK001
   2024-01-16,"Staff Salary",2500.00,Debit,ACH002
   2024-01-17,"Facebook Ads",150.00,Debit,CC003
   ```

2. **Categorization Rules**
   ```javascript
   const categorizationRules = {
     contributions: [
       /contribution/i,
       /donation/i,
       /fundraiser/i
     ],
     expenses: {
       staff: [/salary/i, /payroll/i, /wages/i],
       advertising: [/facebook/i, /google/i, /ads/i],
       events: [/venue/i, /catering/i, /event/i],
       consulting: [/consultant/i, /strategy/i, /advisor/i]
     }
   }
   ```

---

## Historical Election Data

### County-Level Data Import

1. **Data Sources**
   ```
   Primary Sources:
   - MIT Election Data + Science Lab
   - Federal Election Commission (FEC)
   - Secretary of State websites
   - David Leip's Atlas of U.S. Presidential Elections
   
   Format Requirements:
   - CSV with standardized county FIPS codes
   - Consistent field naming across years
   - Vote totals by party/candidate
   ```

2. **Standard Schema**
   ```csv
   year,state,county_name,county_fips,office,candidate,party,votes,total_votes
   2020,Pennsylvania,Philadelphia,42101,President,Biden,Democratic,603790,749317
   2020,Pennsylvania,Philadelphia,42101,President,Trump,Republican,132870,749317
   2016,Pennsylvania,Philadelphia,42101,President,Clinton,Democratic,584025,716993
   ```

3. **Import Process**
   ```
   1. Validate data format and completeness
   2. Geocode county information
   3. Calculate vote percentages and margins
   4. Assign American Nations regions
   5. Generate trend analysis
   6. Create comparative datasets
   ```

### Custom Data Integration

1. **Demographic Data Sources**
   ```
   - U.S. Census Bureau (demographic data)
   - Bureau of Labor Statistics (economic data)
   - Pew Research (polling and typology data)
   - Local election offices (district-specific data)
   ```

2. **API Integrations**
   ```javascript
   // Census API example
   const censusData = await fetch(
     'https://api.census.gov/data/2020/dec/pl?get=P1_001N&for=county:*&in=state:42',
     {
       headers: {
         'X-API-Key': process.env.CENSUS_API_KEY
       }
     }
   )
   ```

---

## Data Validation & Quality Assurance

### Automated Validation Rules

1. **Contact Data Validation**
   ```javascript
   const validationRules = {
     email: {
       required: false,
       format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
       blacklist: ['noemail@', 'test@', 'fake@']
     },
     phone: {
       required: false,
       format: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
       minLength: 10
     },
     address: {
       required: true,
       components: ['street', 'city', 'state', 'zip'],
       uspsValidation: true
     }
   }
   ```

2. **Financial Data Validation**
   ```javascript
   const financialValidation = {
     amount: {
       required: true,
       type: 'number',
       minimum: 0,
       maximum: 5800 // Federal contribution limit
     },
     date: {
       required: true,
       format: 'YYYY-MM-DD',
       range: {
         start: '2023-01-01',
         end: new Date().toISOString().split('T')[0]
       }
     }
   }
   ```

### Quality Scoring

1. **Contact Quality Score Calculation**
   ```
   Base Score: 100 points
   
   Deductions:
   - Missing email: -20 points
   - Missing phone: -15 points
   - Invalid address: -25 points
   - Duplicate record: -30 points
   - Outdated information (>2 years): -10 points
   
   Quality Levels:
   - Excellent: 90-100 points
   - Good: 70-89 points
   - Fair: 50-69 points
   - Poor: <50 points
   ```

2. **Data Completeness Report**
   ```
   Field Completeness Analysis:
   - Name: 99.8% (25,200/25,234)
   - Address: 98.5% (24,856/25,234)
   - Phone: 67.3% (16,980/25,234)
   - Email: 45.8% (11,557/25,234)
   - Party Registration: 92.1% (23,240/25,234)
   ```

---

## Migration Timeline & Checklist

### Phase 1: Preparation (Week 1)
- [ ] Complete data audit and assessment
- [ ] Identify all data sources and formats
- [ ] Create backup of existing systems
- [ ] Set up Akashic Intelligence campaign
- [ ] Configure user accounts and permissions
- [ ] Test import tools with sample data

### Phase 2: Core Data Migration (Week 2)
- [ ] Import voter file (Day 1-2)
- [ ] Validate voter data quality (Day 3)
- [ ] Import contact/volunteer data (Day 4-5)
- [ ] Import financial data (Day 6-7)
- [ ] Run initial AI enhancements

### Phase 3: Historical & Supplementary Data (Week 3)
- [ ] Import historical election data
- [ ] Add demographic and census data
- [ ] Configure AI models and scoring
- [ ] Set up automated sync schedules
- [ ] Train team on new system

### Phase 4: Validation & Go-Live (Week 4)
- [ ] Complete data validation and quality check
- [ ] User acceptance testing
- [ ] Staff training and documentation review
- [ ] Parallel system operation (1 week)
- [ ] Full system go-live
- [ ] Decommission old systems

---

## Troubleshooting

### Common Import Issues

1. **File Format Errors**
   ```
   Problem: "Invalid CSV format" error
   Solution: 
   - Ensure UTF-8 encoding
   - Remove special characters from headers
   - Check for consistent column count across rows
   - Validate delimiter usage (comma vs semicolon)
   ```

2. **Data Type Mismatches**
   ```
   Problem: Date fields not importing correctly
   Solution:
   - Use ISO format (YYYY-MM-DD)
   - Check for null/empty date values
   - Verify timezone consistency
   ```

3. **Duplicate Detection Issues**
   ```
   Problem: False duplicate matches
   Solution:
   - Adjust matching sensitivity settings
   - Review matching criteria (exact vs fuzzy)
   - Manually review flagged duplicates
   - Use multiple matching fields
   ```

### Performance Optimization

1. **Large File Imports**
   ```
   For files >50MB:
   - Split into smaller chunks (10,000 records each)
   - Use batch processing mode
   - Schedule imports during off-peak hours
   - Monitor system resources during import
   ```

2. **API Rate Limiting**
   ```
   If hitting API limits:
   - Implement exponential backoff
   - Batch API requests
   - Use caching for repeated queries
   - Spread imports across multiple hours
   ```

---

## Post-Migration Verification

### Data Integrity Checks

1. **Record Count Verification**
   ```sql
   -- Compare pre and post migration counts
   SELECT 
     'Voters' as table_name,
     COUNT(*) as akashic_count,
     25847 as source_count,
     (COUNT(*) - 25847) as difference
   FROM voters
   WHERE campaign_id = 'camp_123'
   ```

2. **Field Completeness Check**
   ```sql
   -- Check for missing critical data
   SELECT 
     'Missing Email' as issue,
     COUNT(*) as count
   FROM contacts 
   WHERE email IS NULL OR email = ''
   
   UNION ALL
   
   SELECT 
     'Missing Phone' as issue,
     COUNT(*) as count
   FROM contacts 
   WHERE phone IS NULL OR phone = ''
   ```

3. **Data Quality Validation**
   ```sql
   -- Check for data quality issues
   SELECT 
     c.id,
     c.email,
     c.phone,
     CASE 
       WHEN c.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' 
       THEN 'Invalid Email'
       WHEN c.phone !~ '^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$' 
       THEN 'Invalid Phone'
       ELSE 'Valid'
     END as validation_status
   FROM contacts c
   WHERE campaign_id = 'camp_123'
   ```

### AI Enhancement Verification

1. **Scoring Validation**
   ```
   Check AI-generated scores:
   - Turnout scores between 0-100
   - Persuasion scores between 0-100
   - Political typology assignments
   - American Nations region mapping
   ```

2. **Sample Record Review**
   ```json
   {
     "voter_id": "12345",
     "name": "Jane Smith",
     "scores": {
       "turnout": 78,
       "persuasion": 65,
       "contact_priority": 82
     },
     "typology": "Democratic Mainstays",
     "american_nation": "Yankeedom",
     "last_updated": "2024-01-15T10:30:00Z"
   }
   ```

### Success Metrics

1. **Migration Success Criteria**
   - [ ] >95% of records successfully imported
   - [ ] <5% data quality issues
   - [ ] All critical fields populated
   - [ ] AI enhancements completed
   - [ ] User acceptance testing passed
   - [ ] Performance benchmarks met

2. **Operational Readiness**
   - [ ] Staff trained on new system
   - [ ] Data sync schedules configured
   - [ ] Backup and recovery tested
   - [ ] Security configurations verified
   - [ ] Integration endpoints functional

---

## Support & Resources

### Migration Support Contacts
- **Technical Support**: tech-support@akashic.ai
- **Data Migration Specialist**: migration@akashic.ai
- **Account Manager**: [your-account-manager]@akashic.ai

### Documentation References
- [API Documentation](./api_documentation.md)
- [Database Schema](./campaign-console-database.md)
- [User Guide](./user_guide.md)
- [Security Documentation](./security_documentation.md)

### Training Resources
- Migration webinar recordings
- Video tutorials for data import
- Best practices guide
- FAQ and troubleshooting wiki

---

This comprehensive data migration guide ensures a smooth transition to the Akashic Intelligence Campaign Console while maintaining data integrity and maximizing the platform's AI-powered capabilities.