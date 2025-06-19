# Voter File Fields Specification

## Overview
This document provides a comprehensive list of fields typically found in voter files from state election offices and commercial data vendors like L2, NationBuilder, and NGP VAN. These fields are essential for building a professional voter CRM system.

## 1. Standard State-Provided Voter File Fields

### Core Identification Fields
- **voter_id**: State-issued unique voter ID
- **state_voter_id**: State-specific voter registration number
- **county_voter_id**: County-level voter ID (where applicable)

### Name Fields
- **first_name**: Voter's first name
- **middle_name**: Voter's middle name or initial
- **last_name**: Voter's last name
- **name_suffix**: Jr., Sr., III, etc.
- **name_prefix**: Mr., Mrs., Ms., Dr., etc.
- **full_name**: Complete formatted name

### Address Fields
- **residence_address_line1**: Street address
- **residence_address_line2**: Apartment, unit, etc.
- **residence_city**: City
- **residence_state**: State (2-letter code)
- **residence_zip**: 5-digit ZIP code
- **residence_zip4**: ZIP+4
- **mailing_address_line1**: Mailing street address (if different)
- **mailing_address_line2**: Mailing apartment, unit, etc.
- **mailing_city**: Mailing city
- **mailing_state**: Mailing state
- **mailing_zip**: Mailing ZIP code
- **mailing_zip4**: Mailing ZIP+4

### Registration Information
- **registration_date**: Date registered to vote (MM/DD/YYYY)
- **registration_status**: Active, Inactive, Removed, etc.
- **registration_status_reason**: Reason for status
- **party_affiliation**: D, R, I, G, L, etc. (varies by state)
- **previous_party**: Previous party affiliation

### Demographics (State-Provided)
- **birth_date**: Date of birth (often redacted/protected)
- **birth_year**: Year of birth
- **age**: Calculated age
- **gender**: M/F/U
- **race**: Race (where collected by state)
- **ethnicity**: Hispanic/Non-Hispanic (where collected)

### District Assignments
- **county_code**: County FIPS code
- **county_name**: County name
- **precinct_code**: Voting precinct code
- **precinct_name**: Voting precinct name
- **congressional_district**: U.S. House district
- **state_senate_district**: State Senate district
- **state_house_district**: State House/Assembly district
- **judicial_district**: Judicial district
- **school_district**: School board district
- **city_council_district**: City council district
- **commissioner_district**: County commissioner district
- **ward**: Municipal ward
- **township**: Township (where applicable)

### Voting History
- **vote_history**: Array/list of elections participated in
- **election_[YYYYMMDD]**: Individual fields for each election
- **vote_method_[YYYYMMDD]**: How voted (in-person, absentee, early)
- **party_voted_[YYYYMMDD]**: Primary party ballot (if applicable)
- **times_voted_general**: Count of general elections
- **times_voted_primary**: Count of primary elections
- **times_voted_special**: Count of special elections
- **last_vote_date**: Date of most recent vote

## 2. Enhanced Commercial Data Fields

### Contact Information
- **phone_home**: Home phone number
- **phone_work**: Work phone number
- **phone_cell**: Cell/mobile phone number
- **phone_preferred**: Best number to reach
- **phone_do_not_call**: DNC flag
- **email**: Primary email address
- **email_secondary**: Secondary email
- **email_subscribed**: Email subscription status
- **email_bounce_status**: Email deliverability

### Enhanced Demographics
- **education_level**: HS, Some College, Bachelor's, Graduate
- **occupation**: Occupation/profession
- **employer**: Employer name
- **income_range**: Household income bracket
- **net_worth_range**: Estimated net worth
- **home_ownership**: Own/Rent
- **home_value**: Estimated home value
- **length_of_residence**: Years at address
- **marital_status**: Single/Married/Divorced/Widowed
- **household_size**: Number in household
- **children_presence**: Y/N
- **number_of_children**: Count of children

### Modeled/Predicted Data
- **party_score_dem**: Democratic party propensity (0-100)
- **party_score_rep**: Republican party propensity (0-100)
- **ideology_score**: Liberal-Conservative scale
- **turnout_score**: Likelihood to vote (0-100)
- **persuasion_score**: Likelihood to change vote (0-100)

### Issue Scores (0-100 scale)
- **issue_abortion**: Abortion rights support
- **issue_gun_control**: Gun control support
- **issue_climate**: Climate action priority
- **issue_healthcare**: Healthcare reform support
- **issue_immigration**: Immigration reform support
- **issue_education**: Education funding priority
- **issue_economy**: Economic issues priority
- **issue_taxes**: Tax policy preferences

### Behavioral/Lifestyle Indicators
- **political_donor**: Has made political donations
- **charitable_donor**: Makes charitable donations
- **veteran_household**: Veteran in household
- **union_member**: Union membership
- **religious_affiliation**: Religious preference
- **outdoor_enthusiast**: Hunting/fishing licenses
- **social_media_user**: Active on social media

### Geographic Enhancements
- **latitude**: Rooftop latitude
- **longitude**: Rooftop longitude
- **census_tract**: Census tract code
- **census_block**: Census block code
- **urban_rural_code**: Urban/Suburban/Rural classification
- **media_market**: DMA/Media market

### Commercial Vendor IDs
- **l2_id**: L2 unique identifier
- **nationbuilder_id**: NationBuilder ID
- **ngp_van_id**: NGP VAN ID
- **catalist_id**: Catalist person ID

## 3. Campaign-Specific Fields

### Voter Contact History
- **contact_attempts**: Number of contact attempts
- **contact_successful**: Number of successful contacts
- **last_contact_date**: Date of most recent contact
- **last_contact_method**: Phone/Door/Email/Text
- **canvass_result**: Support level (1-5 scale)
- **volunteer_status**: Willing to volunteer
- **yard_sign_status**: Requested/Has yard sign
- **absentee_ballot_request**: Requested absentee ballot

### Tags and Custom Fields
- **tags**: Flexible tagging system
- **custom_field_1-20**: User-defined fields
- **notes**: Free-text notes field
- **do_not_contact**: DNC flag
- **deceased**: Deceased flag

## 4. File Format Specifications

### CSV Structure
```csv
voter_id,first_name,last_name,residence_address_line1,residence_city,residence_state,residence_zip,party_affiliation,registration_date,phone_cell,email
123456789,John,Doe,123 Main St,Anytown,OH,12345,D,01/15/2010,555-123-4567,john.doe@email.com
```

### Field Naming Conventions
- Use lowercase with underscores (snake_case)
- Prefix with category (e.g., `phone_`, `address_`, `vote_`)
- Use standard abbreviations (dem, rep, ind)
- Date fields use `_date` suffix
- Boolean fields use is/has prefix or _flag suffix

### Data Types and Constraints
| Field Type | Format | Example |
|------------|--------|---------|
| IDs | Alphanumeric, no spaces | ABC123456 |
| Names | Unicode, 50 char max | María García-López |
| Addresses | Unicode, 100 char max | 123 Main St Apt 4B |
| Dates | MM/DD/YYYY or YYYY-MM-DD | 01/15/2023 |
| Phone | E.164 or (XXX) XXX-XXXX | +1 (555) 123-4567 |
| Email | RFC 5322 compliant | voter@example.com |
| Scores | Integer 0-100 | 75 |
| Boolean | Y/N, 1/0, TRUE/FALSE | Y |
| Party | Single letter or 3-letter | D or DEM |

### Common File Encodings
- **Preferred**: UTF-8 with BOM
- **Alternative**: UTF-8 without BOM
- **Legacy**: ISO-8859-1 (Latin-1)

### File Size Considerations
- State files: 1-40 million records
- Enhanced files: 200-700 fields per record
- Typical file sizes: 1-50 GB uncompressed
- Compression: Use ZIP or GZIP

## 5. Data Quality Indicators

### Confidence Scores
- **name_confidence**: Name match confidence
- **address_confidence**: Address validity confidence
- **phone_confidence**: Phone number validity
- **email_confidence**: Email validity confidence

### Data Source Fields
- **last_updated**: Date record last updated
- **data_source**: Source of information
- **ncoa_flag**: National Change of Address match
- **deceased_flag**: Matched to death records

## 6. Privacy and Compliance Fields

### Consent and Preferences
- **consent_contact**: Consent to contact
- **consent_email**: Email consent
- **consent_sms**: SMS/text consent
- **consent_date**: Date consent given
- **gdpr_status**: GDPR compliance status
- **ccpa_status**: CCPA compliance status

### Suppression Fields
- **global_suppress**: Global suppression flag
- **prison_suppress**: Incarcerated suppression
- **military_suppress**: Military overseas suppression

## Best Practices for Implementation

1. **Field Selection**: Not all fields are available in all states or from all vendors
2. **Data Freshness**: Voter files should be updated at least monthly
3. **Standardization**: Always standardize addresses using USPS CASS certification
4. **Deduplication**: Implement robust deduplication logic
5. **Privacy**: Follow all applicable privacy laws and regulations
6. **Audit Trail**: Maintain history of all data changes
7. **Performance**: Index frequently queried fields
8. **Validation**: Implement field-level validation rules

## Common Integration Patterns

### Import Workflow
1. Validate CSV headers against expected schema
2. Parse and validate individual records
3. Standardize addresses and phone numbers
4. Match against existing records
5. Update or insert as appropriate
6. Log all changes and errors

### Export Formats
- **Walk lists**: Subset of fields for canvassers
- **Phone lists**: Contact info plus script variables
- **Mail lists**: Address fields plus targeting data
- **Digital lists**: Email/phone plus modeled scores

This specification provides the foundation for building a comprehensive voter CRM system that can handle data from multiple sources while maintaining data quality and compliance standards.