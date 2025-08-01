/**
 * A simple script to test the updated primaries API
 * This will fetch candidates for the district level
 * and log the structure to verify our changes
 */
const axios = require('axios');
const url = 'http://localhost:3001/api/primaries-elections/candidates/DISTRICT';

const testAPI = async () => {
  try {
    console.log('Testing Primaries Elections API for lowercase property names...');
    const response = await axios.get(url);
    
    if (response.data && response.data.length > 0) {
      const sample = response.data[0];
      console.log('Response structure:');
      
      // Check administrative unit properties
      const adminUnits = ['candidate', 'region', 'subregion', 'district', 'constituencyMunicipality', 
                         'subcountyDivision', 'parishWard', 'villageCell'];
      
      adminUnits.forEach(unit => {
        if (sample[unit]) {
          console.log(`✓ ${unit} exists with correct lowercase name`);
        } else {
          console.log(`✗ ${unit} not found or incorrectly named`);
          const capitalUnit = unit.charAt(0).toUpperCase() + unit.slice(1);
          if (sample[capitalUnit]) {
            console.log(`  Found as ${capitalUnit} instead!`);
          }
        }
      });
      
      console.log('\nSample data structure:', JSON.stringify(sample, null, 2));
    } else {
      console.log('No data returned or empty response');
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

testAPI();
