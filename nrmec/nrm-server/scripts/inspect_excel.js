const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Configuration
const EXCEL_FILE_PATH = path.join(__dirname, '../2025/internal elections/KALANGALA VILLAGE PARTY STRUCTURES RESULT  2025.xlsx');

async function inspectExcelFile() {
  try {
    console.log('📊 Excel File Inspector');
    console.log('='.repeat(50));
    
    // Check if file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      throw new Error(`Excel file not found: ${EXCEL_FILE_PATH}`);
    }
    
    console.log(`✅ File found: ${EXCEL_FILE_PATH}`);
    
    // Read Excel file
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    console.log(`📑 Sheets found: ${workbook.SheetNames.join(', ')}`);
    
    // Inspect first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`\n📈 Sheet: "${sheetName}"`);
    console.log(`📊 Total rows: ${rawData.length}`);
    
    // Show first few rows
    console.log('\n📋 First 10 rows:');
    rawData.slice(0, 10).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);
    });
    
    // Analyze column structure
    if (rawData.length > 0) {
      const headerRow = rawData[0];
      console.log('\n🏷️ Assumed Header Structure:');
      headerRow.forEach((header, index) => {
        console.log(`  Column ${index}: "${header}"`);
      });
      
      // Show sample data row
      if (rawData.length > 1) {
        console.log('\n📝 Sample Data Row:');
        const sampleRow = rawData[1];
        sampleRow.forEach((cell, index) => {
          console.log(`  Column ${index}: "${cell}"`);
        });
      }
    }
    
    // Statistics
    console.log('\n📊 Data Analysis:');
    let emptyRows = 0;
    let rowsWithData = 0;
    
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0 || !row[0] || row[0].toString().trim() === '') {
        emptyRows++;
      } else {
        rowsWithData++;
      }
    }
    
    console.log(`  - Rows with data: ${rowsWithData}`);
    console.log(`  - Empty/boundary rows: ${emptyRows}`);
    console.log(`  - Expected candidates: ${rowsWithData}`);
    
    // Check for potential issues
    console.log('\n⚠️ Potential Issues:');
    let issues = [];
    
    if (rawData.length < 2) {
      issues.push('File appears to have no data rows');
    }
    
    if (rawData[0] && rawData[0].length < 4) {
      issues.push('File may not have enough columns (expected at least 4: name, phone, category, position)');
    }
    
    if (issues.length === 0) {
      console.log('  - No obvious issues detected');
    } else {
      issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Review the column structure above');
    console.log('2. Update the script column mapping if needed');
    console.log('3. Run the main processing script: npm run process-kalangala');
    
  } catch (error) {
    console.error('❌ Error inspecting file:', error.message);
  }
}

// Run inspection
inspectExcelFile();
