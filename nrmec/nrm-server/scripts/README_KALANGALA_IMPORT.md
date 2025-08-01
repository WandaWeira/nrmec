# Kalangala Village Party Structures Data Import

This script processes the Excel file `KALANGALA VILLAGE PARTY STRUCTURES RESULT 2025.xlsx` and prepares it for import into the NRM Elections database.

## 📋 Prerequisites

1. Ensure the Excel file is located at: `nrm-server/2025/internal elections/KALANGALA VILLAGE PARTY STRUCTURES RESULT 2025.xlsx`
2. Database should be running and accessible
3. Administrative units (Regions, Districts, etc.) should be populated in the database

## 🚀 How to Run

```bash
# Navigate to the server directory
cd nrm-server

# Run the processing script
npm run process-kalangala
```

## 📊 What the Script Does

### Data Processing Rules:

1. **NIN Generation**:
   - Generates random NIN numbers with format: `KAL` + 10 random digits
   - If candidate with same names exists, uses existing NIN
   - Ensures all NINs are unique

2. **Name Processing**:
   - **Format**: "FIRST MIDDLE LAST" → firstName: "LAST", lastName: "FIRST MIDDLE"
   - **Example**: "NALAAKI ROBINAH NAMAWEJJE" → firstName: "NAMAWEJJE", lastName: "NALAAKI ROBINAH"
   - Skips rows with empty names (boundaries)

3. **Phone Number Cleaning**:
   - Invalid/empty numbers → "0700000000"
   - Handles Uganda formats (+256, 0xxx)
   - Validates 10-digit format

4. **Election Type**: All candidates set to "INTERNAL_PARTY"

5. **Position Path**: Format "INTERNAL_PARTY.VILLAGE_CELL.{CATEGORY}.{POSITION}"

6. **Administrative Units**:
   - Searches database for matching District, Subcounty, Parish, Village
   - Reports errors if units not found

## 📁 Output Files

### 1. CSV File: `scripts/kalangala_village_processed_data.csv`
Contains all processed records with the following columns:

| Column | Description |
|--------|-------------|
| ninNumber | Generated or existing NIN |
| firstName | Last name from original (as per rule) |
| lastName | First/middle names from original |
| gender | Default 'M' (can be enhanced) |
| phoneNumber | Cleaned phone number |
| electionType | "INTERNAL_PARTY" |
| level | "VILLAGE_CELL" |
| positionPath | Full position path |
| category | Category (YOUTH, WOMEN, etc.) |
| position | Position (CHAIRPERSON, etc.) |
| regionId | Database ID for region |
| subregionId | Database ID for subregion |
| districtId | Database ID for district |
| constituencyMunicipalityId | Database ID |
| subcountyDivisionId | Database ID |
| parishWardId | Database ID |
| villageCellId | Database ID |
| year | 2025 |
| status | "pending" |
| isNominated | false |
| sourceRow | Original Excel row number |
| originalName | Original name from Excel |
| originalPhone | Original phone from Excel |
| originalCategory | Original category from Excel |
| originalPosition | Original position from Excel |
| originalDistrict | Original district from Excel |
| originalSubcounty | Original subcounty from Excel |
| originalParish | Original parish from Excel |
| originalVillage | Original village from Excel |

### 2. Console Output
- Processing summary
- Error reports
- Success counts

## ❌ Common Issues to Fix

### 1. Administrative Unit Not Found
```
Error: District 'kalangala central' not found in database
```
**Solution**: Ensure the district exists in the database with exact name matching.

### 2. Excel Column Mapping
The script assumes this column order:
- Column 0: Name
- Column 1: Phone
- Column 2: Category  
- Column 3: Position
- Column 4: District
- Column 5: Subcounty
- Column 6: Parish
- Column 7: Village

**Solution**: Adjust column indices in the script if your Excel has different structure.

### 3. Category/Position Validation
Categories must match internal elections config:
- YOUTH, WOMEN, PWDs, VETERANS, ELDERS, MAINSTREAM

Positions must match:
- CHAIRPERSON, VICE_CHAIRPERSON, GENERAL_SECRETARY, SECRETARY_FINANCE, SECRETARY_PUBLICITY

## 🔄 Database Insertion

**⚠️ IMPORTANT**: The script does NOT insert data automatically for safety.

After reviewing the CSV output:

1. **Review the CSV file** thoroughly
2. **Check error messages** and fix data issues
3. **Uncomment the insertion code** in the script:
   ```javascript
   // In the insertDataToDatabase function, uncomment the code block
   ```
4. **Run the script again** to insert data

## 📝 Sample Output

See `scripts/sample_kalangala_output.csv` for example of expected output format.

## 🛠️ Customization

### Adjust Excel Column Mapping
In the script, modify these lines:
```javascript
const nameField = row[0]; // Change index for name column
const phoneField = row[1]; // Change index for phone column
const categoryField = row[2]; // Change index for category column
// ... etc
```

### Change Gender Detection
Enhance the gender assignment:
```javascript
// Simple name-based gender detection
const gender = nameData.firstName.toLowerCase().endsWith('a') ? 'F' : 'M';
```

### Administrative Unit Handling
If your data has different admin unit structure, modify the admin unit lookup logic.

## 🔍 Validation Steps

1. **Check candidate counts**: Compare Excel rows to processed records
2. **Verify admin units**: Ensure all districts/villages are found
3. **Review duplicates**: Check existing candidates handling
4. **Position paths**: Verify category/position combinations are valid
5. **Phone numbers**: Check phone number cleaning worked correctly

## 📞 Support

If you encounter issues:
1. Check the console error messages
2. Verify your Excel file structure matches expected format
3. Ensure all required administrative units exist in database
4. Review the CSV output for data accuracy

---

**Remember**: Always backup your database before running data imports!
