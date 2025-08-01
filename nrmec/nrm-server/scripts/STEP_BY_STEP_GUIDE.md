# 🚀 Kalangala Village Data Import - Step by Step Guide

## 📋 Complete Setup and Processing Instructions

### Step 1: Prepare Your Environment

```powershell
# Navigate to the server directory
cd "d:\Ikiru\Projects\2025\NRMREDESIGN\working-repo\nrm-elections\nrm-elections\nrm-server"

# Make sure your database is running and accessible
# Ensure you have the Excel file in the correct location
```

### Step 2: Validate Database Setup

```powershell
# Check if administrative units exist in database
npm run validate-admin
```

**Expected Output:**
- Should show regions, districts, and other admin units
- Look for "Kalangala" in the output
- If Kalangala district is missing, you'll need to add it first

### Step 3: Inspect Your Excel File

```powershell
# Examine the structure of your Excel file
npm run inspect-excel
```

**What This Shows:**
- Column structure of your Excel file
- Sample data rows
- Number of candidates expected
- Potential issues with file format

**If you see issues:**
- Column mapping might be wrong
- File might have different structure than expected
- May need to adjust column indices in the main script

### Step 4: Process the Data (DRY RUN)

```powershell
# Process the Excel file (does NOT insert to database)
npm run process-kalangala
```

**What This Does:**
- ✅ Reads your Excel file
- ✅ Processes all data according to rules
- ✅ Generates random NINs or reuses existing ones
- ✅ Cleans phone numbers
- ✅ Validates administrative units
- ✅ Creates CSV output file
- ❌ Does NOT insert data to database yet

**Output Files:**
- `scripts/kalangala_village_processed_data.csv` - All processed records
- Console output with summary and errors

### Step 5: Review Processed Data

1. **Open the CSV file:** `scripts/kalangala_village_processed_data.csv`
2. **Check for errors** in the console output
3. **Verify data accuracy:**
   - Names split correctly (last name → firstName)
   - Phone numbers cleaned properly
   - Categories and positions valid
   - Administrative units found

### Step 6: Fix Any Issues

Common issues and solutions:

#### 🔧 Administrative Unit Not Found
```
Error: District 'kalangala central' not found in database
```
**Solution:** Add the missing district to your database, or update Excel data with correct district name.

#### 🔧 Wrong Column Mapping
If Excel columns don't match script expectations, edit `process_kalangala_village_data.js`:

```javascript
// Around line 200, adjust these column indices:
const nameField = row[0];      // Change to correct column for names
const phoneField = row[1];     // Change to correct column for phone
const categoryField = row[2];  // Change to correct column for category
const positionField = row[3];  // Change to correct column for position
```

#### 🔧 Invalid Categories/Positions
Ensure your Excel data uses these exact categories:
- `YOUTH`, `WOMEN`, `PWDs`, `VETERANS`, `ELDERS`, `MAINSTREAM`

And these exact positions:
- `CHAIRPERSON`, `VICE_CHAIRPERSON`, `GENERAL_SECRETARY`, `SECRETARY_FINANCE`, `SECRETARY_PUBLICITY`

### Step 7: Insert Data to Database

⚠️ **IMPORTANT: Only do this after reviewing the CSV output!**

1. **Edit the script** `scripts/process_kalangala_village_data.js`
2. **Find the `insertDataToDatabase` function** (around line 450)
3. **Uncomment the code block** inside the function:

```javascript
// Remove the /* and */ around this entire block:
/*
const transaction = await sequelize.transaction();

try {
  const candidatesCreated = [];
  // ... rest of the insertion code
} catch (error) {
  // ... error handling
}
*/
```

4. **Run the script again:**
```powershell
npm run process-kalangala
```

### Step 8: Verify Database Insertion

Check your database to ensure:
- New candidates were created in `Candidates` table
- New participations were created in `CandidateParticipations` table
- No duplicate candidates with same names
- All fields populated correctly

## 📊 Expected Results

### Data Transformation Examples:

| Original Excel | Processed Result |
|----------------|------------------|
| **Name:** "NALAAKI ROBINAH NAMAWEJJE" | **firstName:** "NAMAWEJJE"<br>**lastName:** "NALAAKI ROBINAH" |
| **Phone:** "071234567" | **phoneNumber:** "0700000000" (if invalid)<br>**phoneNumber:** "0712345678" (if valid) |
| **Category:** "Youth" | **category:** "YOUTH" |
| **Position:** "Chairperson" | **position:** "CHAIRPERSON" |

### Position Path Generation:
- **Input:** Category="YOUTH", Position="CHAIRPERSON"
- **Output:** positionPath="INTERNAL_PARTY.VILLAGE_CELL.YOUTH.CHAIRPERSON"

## 🛠️ Troubleshooting

### Script Won't Run
```powershell
# Make sure you're in the right directory
cd "d:\Ikiru\Projects\2025\NRMREDESIGN\working-repo\nrm-elections\nrm-elections\nrm-server"

# Check if node_modules exists
ls node_modules

# If not, install dependencies
npm install
```

### Excel File Not Found
```
Error: Excel file not found
```
**Solution:** Ensure file is at: `nrm-server/2025/internal elections/KALANGALA VILLAGE PARTY STRUCTURES RESULT  2025.xlsx`

### Database Connection Issues
```
Error: connect ECONNREFUSED
```
**Solutions:**
- Start your MySQL/database server
- Check database credentials in `config/config.json`
- Ensure database exists

### Permission Errors
```
Error: EACCES: permission denied
```
**Solutions:**
- Run PowerShell as Administrator
- Check file permissions on Excel file and scripts folder

## 📝 Files Created

After running the scripts, you'll have:

1. **`scripts/kalangala_village_processed_data.csv`** - Main output with all processed records
2. **Console logs** - Processing summary and any errors
3. **Database records** - (only after uncommenting insertion code)

## 🔄 Re-running the Process

If you need to run again:

1. **For testing:** Just run `npm run process-kalangala` (safe, doesn't insert)
2. **For insertion:** Make sure insertion code is uncommented
3. **To avoid duplicates:** The script checks for existing candidates by name

## 📞 Final Notes

- **Always backup your database** before inserting data
- **Review the CSV output** thoroughly before database insertion
- **The script is designed to be safe** - it won't insert without you explicitly uncommenting the code
- **Phone numbers default to "0700000000"** if invalid/missing
- **NIN numbers are auto-generated** with format "KAL" + 10 digits
- **Existing candidates with same names** will reuse existing NIN numbers

---

**Ready to process your Kalangala village data! 🎯**
