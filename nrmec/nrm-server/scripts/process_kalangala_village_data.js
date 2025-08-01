const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { Candidate, District, Region, Subregion, ConstituencyMunicipality, SubcountyDivision, ParishWard, VillageCell, sequelize } = require('../models');

// Configuration
const EXCEL_FILE_PATH = path.join(__dirname, '../2025/internal elections/KALANGALA VILLAGE PARTY STRUCTURES RESULT  2025.xlsx');
const OUTPUT_CSV_PATH = path.join(__dirname, 'kalangala_village_processed_data.csv');
const CURRENT_YEAR = 2025;

// Generate random NIN
function generateRandomNIN() {
  const prefix = 'KAL'; // Kalangala prefix
  const randomNumbers = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return prefix + randomNumbers;
}

// Clean and validate phone number
function cleanPhoneNumber(phone) {
  if (!phone || phone.toString().trim() === '' || phone.toString().length < 10) {
    return '0700000000';
  }
  
  let cleaned = phone.toString().replace(/\D/g, ''); // Remove non-digits
  
  // Handle Uganda phone number formats
  if (cleaned.startsWith('256')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('+256')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (!cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }
  
  // Validate length
  if (cleaned.length !== 10) {
    return '0700000000';
  }
  
  return cleaned;
}

// Parse name field - last name becomes firstName, rest becomes lastName
function parseName(nameField) {
  if (!nameField || nameField.toString().trim() === '') {
    return null; // Skip empty names
  }
  
  const names = nameField.toString().trim().split(' ').filter(n => n.length > 0);
  
  if (names.length === 0) {
    return null;
  }
  
  if (names.length === 1) {
    return {
      firstName: names[0],
      lastName: names[0] // Use same name for both
    };
  }
  
  const firstName = names[names.length - 1]; // Last name becomes firstName
  const lastName = names.slice(0, -1).join(' '); // Rest becomes lastName
  
  return { firstName, lastName };
}

// Generate position path
function generatePositionPath(category, position) {
  return `INTERNAL_PARTY.VILLAGE_CELL.${category.toUpperCase()}.${position.toUpperCase()}`;
}

// Main processing function
async function processExcelFile() {
  try {
    console.log('🔄 Starting Excel file processing...');
    
    // Check if file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      throw new Error(`Excel file not found: ${EXCEL_FILE_PATH}`);
    }
    
    // Read Excel file
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 Found ${rawData.length} rows in Excel file`);
    
    // Process data
    const processedRecords = [];
    const errors = [];
    const existingNINs = new Set();
    const existingNamePairs = new Set();
    
    // Get existing candidates to check for duplicates
    console.log('🔍 Checking existing candidates...');
    const existingCandidates = await Candidate.findAll({
      attributes: ['ninNumber', 'firstName', 'lastName'],
      raw: true
    });
    
    existingCandidates.forEach(candidate => {
      existingNINs.add(candidate.ninNumber);
      existingNamePairs.add(`${candidate.firstName.toLowerCase()}_${candidate.lastName.toLowerCase()}`);
    });
    
    console.log(`Found ${existingCandidates.length} existing candidates`);
    
    // Administrative unit caches
    const adminUnitCache = {
      regions: {},
      subregions: {},
      districts: {},
      constituencies: {},
      subcounties: {},
      parishes: {},
      villages: {}
    };
    
    // Populate admin unit caches
    console.log('🏛️ Loading administrative units...');
    
    const regions = await Region.findAll({ raw: true });
    regions.forEach(region => {
      adminUnitCache.regions[region.name.toLowerCase()] = region;
    });
    
    const subregions = await Subregion.findAll({ raw: true });
    subregions.forEach(subregion => {
      adminUnitCache.subregions[subregion.name.toLowerCase()] = subregion;
    });
    
    const districts = await District.findAll({ raw: true });
    districts.forEach(district => {
      adminUnitCache.districts[district.name.toLowerCase()] = district;
    });
    
    const constituencies = await ConstituencyMunicipality.findAll({ raw: true });
    constituencies.forEach(constituency => {
      adminUnitCache.constituencies[constituency.name.toLowerCase()] = constituency;
    });
    
    const subcounties = await SubcountyDivision.findAll({ raw: true });
    subcounties.forEach(subcounty => {
      adminUnitCache.subcounties[subcounty.name.toLowerCase()] = subcounty;
    });
    
    const parishes = await ParishWard.findAll({ raw: true });
    parishes.forEach(parish => {
      adminUnitCache.parishes[parish.name.toLowerCase()] = parish;
    });
    
    const villages = await VillageCell.findAll({ raw: true });
    villages.forEach(village => {
      adminUnitCache.villages[village.name.toLowerCase()] = village;
    });
    
    console.log('✅ Administrative units loaded');
    
    // Process each row
    for (let i = 1; i < rawData.length; i++) { // Skip header row
      const row = rawData[i];
      const rowNumber = i + 1;
      
      try {        // Extract data from row - Updated to match actual Excel structure
        const regionField = row[0];      // REGION
        const subregionField = row[1];   // SUB REGION
        const districtField = row[2];    // DISTRICT
        const constituencyField = row[3]; // CONSTITUENCY
        const subcountyField = row[4];   // SUBCOUNTY
        const parishField = row[5];      // PARISH
        const villageField = row[6];     // VILLAGE
        const categoryField = row[7];    // CATEGORY
        const positionField = row[8];    // POSITION
        const nameField = row[9];        // NAME
        const phoneField = row[10];      // CONTACT
        
        // Skip if name is empty (boundary row)
        const nameData = parseName(nameField);
        if (!nameData) {
          console.log(`⚠️ Row ${rowNumber}: Skipping empty name (boundary)`);
          continue;
        }
        
        // Check if candidate with same names already exists
        const nameKey = `${nameData.firstName.toLowerCase()}_${nameData.lastName.toLowerCase()}`;
        let ninNumber;
        
        if (existingNamePairs.has(nameKey)) {
          // Find existing candidate with same names
          const existingCandidate = existingCandidates.find(c => 
            c.firstName.toLowerCase() === nameData.firstName.toLowerCase() && 
            c.lastName.toLowerCase() === nameData.lastName.toLowerCase()
          );
          ninNumber = existingCandidate.ninNumber;
          console.log(`🔄 Row ${rowNumber}: Using existing NIN for ${nameData.firstName} ${nameData.lastName}: ${ninNumber}`);
        } else {
          // Generate new unique NIN
          do {
            ninNumber = generateRandomNIN();
          } while (existingNINs.has(ninNumber));
          
          existingNINs.add(ninNumber);
          existingNamePairs.add(nameKey);
        }
        
        // Clean phone number
        const phoneNumber = cleanPhoneNumber(phoneField);
        
        // Validate required fields
        if (!categoryField || !positionField) {
          errors.push(`Row ${rowNumber}: Missing category or position`);
          continue;
        }
          // Find administrative units
        const districtName = districtField ? districtField.toString().toLowerCase().trim() : 'kalangala';
        const district = adminUnitCache.districts[districtName];
        
        if (!district) {
          errors.push(`Row ${rowNumber}: District '${districtField}' not found in database`);
          continue;
        }
        
        // Find region
        let region = null;
        if (regionField) {
          const regionName = regionField.toString().toLowerCase().trim();
          region = adminUnitCache.regions[regionName];
          if (!region) {
            errors.push(`Row ${rowNumber}: Region '${regionField}' not found in database`);
          }
        }
        
        // Find subregion
        let subregion = null;
        if (subregionField && subregionField.toString().trim() !== 'SUB REGION') {
          const subregionName = subregionField.toString().toLowerCase().trim();
          subregion = adminUnitCache.subregions[subregionName];
          if (!subregion) {
            // Try to find by district's subregion
            subregion = Object.values(adminUnitCache.subregions).find(sr => sr.id === district.subregionId);
          }
        } else {
          // Use district's subregion
          subregion = Object.values(adminUnitCache.subregions).find(sr => sr.id === district.subregionId);
        }
        
        // Find constituency
        let constituency = null;
        if (constituencyField) {
          const constituencyName = constituencyField.toString().toLowerCase().trim();
          constituency = adminUnitCache.constituencies[constituencyName];
          if (!constituency) {
            errors.push(`Row ${rowNumber}: Constituency '${constituencyField}' not found in database`);
          }
        }
        
        // Find subcounty
        let subcounty = null;
        if (subcountyField) {
          const subcountyName = subcountyField.toString().toLowerCase().trim();
          subcounty = adminUnitCache.subcounties[subcountyName];
          if (!subcounty) {
            errors.push(`Row ${rowNumber}: Subcounty '${subcountyField}' not found in database`);
          }
        }
        
        // Find parish
        let parish = null;
        if (parishField) {
          const parishName = parishField.toString().toLowerCase().trim();
          parish = adminUnitCache.parishes[parishName];
          if (!parish) {
            errors.push(`Row ${rowNumber}: Parish '${parishField}' not found in database`);
          }
        }
        
        // Find village
        let village = null;
        if (villageField) {
          const villageName = villageField.toString().toLowerCase().trim();
          village = adminUnitCache.villages[villageName];
          if (!village) {
            errors.push(`Row ${rowNumber}: Village '${villageField}' not found in database`);
          }
        }
          // Generate position path
        const category = categoryField.toString().trim().toUpperCase().replace(/\s+/g, ''); // Remove extra spaces
        const position = positionField.toString().trim().toUpperCase();
        const positionPath = generatePositionPath(category, position);
        
        // Create record
        const record = {
          // Candidate table fields
          ninNumber,
          firstName: nameData.firstName,
          lastName: nameData.lastName,
          gender: 'M', // Default gender, you can enhance this based on names or add to Excel
          phoneNumber,
          electionType: 'INTERNAL_PARTY',
          
          // CandidateParticipation table fields
          candidateId: null, // Will be set after candidate creation
          electionType: 'INTERNAL_PARTY',
          level: 'VILLAGE_CELL',
          positionPath,
          category,
          position,
          regionId: region ? region.id : null,
          subregionId: subregion ? subregion.id : null,
          districtId: district.id,
          constituencyMunicipalityId: constituency ? constituency.id : null,
          subcountyDivisionId: subcounty ? subcounty.id : null,
          parishWardId: parish ? parish.id : null,
          villageCellId: village ? village.id : null,
          year: CURRENT_YEAR,
          status: 'pending',
          isNominated: false,
          
          // Source data for reference
          sourceRow: rowNumber,
          sourceData: {
            region: regionField,
            subregion: subregionField,
            district: districtField,
            constituency: constituencyField,
            subcounty: subcountyField,
            parish: parishField,
            village: villageField,
            category: categoryField,
            position: positionField,
            name: nameField,
            phone: phoneField
          }
        };
        
        processedRecords.push(record);
        console.log(`✅ Row ${rowNumber}: Processed ${nameData.firstName} ${nameData.lastName} - ${category} ${position}`);
        
      } catch (error) {
        errors.push(`Row ${rowNumber}: Error processing - ${error.message}`);
        console.error(`❌ Row ${rowNumber}: ${error.message}`);
      }
    }
    
    console.log(`\n📈 Processing Summary:`);
    console.log(`- Total rows processed: ${rawData.length - 1}`);
    console.log(`- Successful records: ${processedRecords.length}`);
    console.log(`- Errors: ${errors.length}`);
    
    // Generate CSV output
    if (processedRecords.length > 0) {
      console.log('\n💾 Generating CSV output...');
      await generateCSVOutput(processedRecords);
      console.log(`✅ CSV file generated: ${OUTPUT_CSV_PATH}`);
    }
    
    // Display errors
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    return {
      processedRecords,
      errors,
      summary: {
        totalRows: rawData.length - 1,
        successfulRecords: processedRecords.length,
        errorCount: errors.length
      }
    };
    
  } catch (error) {
    console.error('💥 Fatal error processing Excel file:', error);
    throw error;
  }
}

// Generate CSV output
async function generateCSVOutput(records) {  const headers = [
    'ninNumber', 'firstName', 'lastName', 'gender', 'phoneNumber', 'electionType',
    'level', 'positionPath', 'category', 'position',
    'regionId', 'subregionId', 'districtId', 'constituencyMunicipalityId',
    'subcountyDivisionId', 'parishWardId', 'villageCellId', 'year',
    'status', 'isNominated', 'sourceRow', 'originalRegion', 'originalSubregion',
    'originalDistrict', 'originalConstituency', 'originalSubcounty', 'originalParish',
    'originalVillage', 'originalCategory', 'originalPosition', 'originalName', 'originalPhone'
  ];
  
  let csvContent = headers.join(',') + '\n';
  
  records.forEach(record => {    const row = [
      record.ninNumber,
      `"${record.firstName}"`,
      `"${record.lastName}"`,
      record.gender,
      record.phoneNumber,
      record.electionType,
      record.level,
      `"${record.positionPath}"`,
      record.category,
      record.position,
      record.regionId || '',
      record.subregionId || '',
      record.districtId || '',
      record.constituencyMunicipalityId || '',
      record.subcountyDivisionId || '',
      record.parishWardId || '',
      record.villageCellId || '',
      record.year,
      record.status,
      record.isNominated,
      record.sourceRow,
      `"${record.sourceData.region || ''}"`,
      `"${record.sourceData.subregion || ''}"`,
      `"${record.sourceData.district || ''}"`,
      `"${record.sourceData.constituency || ''}"`,
      `"${record.sourceData.subcounty || ''}"`,
      `"${record.sourceData.parish || ''}"`,
      `"${record.sourceData.village || ''}"`,
      `"${record.sourceData.category || ''}"`,
      `"${record.sourceData.position || ''}"`,
      `"${record.sourceData.name || ''}"`,
      `"${record.sourceData.phone || ''}"`
    ];
    
    csvContent += row.join(',') + '\n';
  });
  
  fs.writeFileSync(OUTPUT_CSV_PATH, csvContent);
}

// Function to actually insert data (commented out for safety)
async function insertDataToDatabase(records) {
  console.log('⚠️ WARNING: This will insert data into the database!');
  console.log('Make sure you have reviewed the processed data first.');
  
  // Uncomment the following code when you're ready to insert
  /*
  const transaction = await sequelize.transaction();
  
  try {
    const candidatesCreated = [];
    const participationsCreated = [];
    
    for (const record of records) {
      // Create or find candidate
      let candidate = await Candidate.findOne({
        where: {
          ninNumber: record.ninNumber
        },
        transaction
      });
      
      if (!candidate) {
        candidate = await Candidate.create({
          ninNumber: record.ninNumber,
          firstName: record.firstName,
          lastName: record.lastName,
          gender: record.gender,
          phoneNumber: record.phoneNumber,
          electionType: record.electionType
        }, { transaction });
        candidatesCreated.push(candidate);
      }
      
      // Create participation
      const participation = await CandidateParticipation.create({
        candidateId: candidate.id,
        electionType: record.electionType,
        level: record.level,
        positionPath: record.positionPath,
        category: record.category,
        position: record.position,
        regionId: record.regionId,
        subregionId: record.subregionId,
        districtId: record.districtId,
        constituencyMunicipalityId: record.constituencyMunicipalityId,
        subcountyDivisionId: record.subcountyDivisionId,
        parishWardId: record.parishWardId,
        villageCellId: record.villageCellId,
        year: record.year,
        status: record.status,
        isNominated: record.isNominated
      }, { transaction });
      
      participationsCreated.push(participation);
    }
    
    await transaction.commit();
    
    console.log(`✅ Successfully inserted:`);
    console.log(`  - Candidates: ${candidatesCreated.length}`);
    console.log(`  - Participations: ${participationsCreated.length}`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error inserting data:', error);
    throw error;
  }
  */
}

// Main execution
async function main() {
  try {
    console.log('🚀 Kalangala Village Party Structures Data Processor');
    console.log('='.repeat(60));
    
    const result = await processExcelFile();
    
    console.log('\n📋 Final Summary:');
    console.log('='.repeat(40));
    console.log(`Total Excel rows: ${result.summary.totalRows}`);
    console.log(`Processed records: ${result.summary.successfulRecords}`);
    console.log(`Errors: ${result.summary.errorCount}`);
    console.log(`Output file: ${OUTPUT_CSV_PATH}`);
    
    if (result.errors.length > 0) {
      console.log('\n⚠️ Review and fix the following errors before proceeding:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('\n✅ All records processed successfully!');
      console.log('📝 Review the CSV file and then uncomment the insertDataToDatabase function to proceed with database insertion.');
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  processExcelFile,
  insertDataToDatabase,
  generateCSVOutput
};
