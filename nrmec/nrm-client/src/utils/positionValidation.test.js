// Test file for position handling validation
// This file contains test cases to verify direct and indirect position handling

import primariesElectionsConfig from '../config/primaries_elections_config.json';

/**
 * Test cases for position path validation
 */
export const positionTestCases = [
  // Direct Position Tests
  {
    name: "Village Cell LC1 Direct Position",
    level: "VILLAGE_CELL",
    category: "LC1",
    subcategory: null,
    position: "LC1",
    expectedPath: "PRIMARIES.VILLAGE_CELL.LC1",
    isDirect: true
  },
  {
    name: "Parish Ward LC2 Direct Position", 
    level: "PARISH_WARD",
    category: "LC2",
    subcategory: null,
    position: "LC2",
    expectedPath: "PRIMARIES.PARISH_WARD.LC2",
    isDirect: true
  },
  {
    name: "District LCV Majors Direct Position",
    level: "DISTRICT",
    category: "LCV_MAJORS",
    subcategory: null,
    position: "LCV_MAJORS",
    expectedPath: "PRIMARIES.DISTRICT.LCV_MAJORS",
    isDirect: true
  },
  {
    name: "National President Direct Position",
    level: "NATIONAL",
    category: "PRESIDENT",
    subcategory: null,
    position: "PRESIDENT",
    expectedPath: "PRIMARIES.NATIONAL.PRESIDENT",
    isDirect: true
  },

  // Subcategory Direct Position Tests
  {
    name: "Councillors Direct Elected Direct Position",
    level: "SUBCOUNTY_DIVISION",
    category: "COUNCILLORS",
    subcategory: "DIRECT_ELECTED_COUNCILLORS",
    position: "DIRECT_ELECTED_COUNCILLORS",
    expectedPath: "PRIMARIES.SUBCOUNTY_DIVISION.COUNCILLORS.DIRECT_ELECTED_COUNCILLORS",
    isDirect: false,
    isSubcategoryDirect: true
  },
  {
    name: "Councillors Female Councillors Direct Position",
    level: "CONSTITUENCY_MUNICIPALITY",
    category: "COUNCILLORS",
    subcategory: "FEMALE_COUNCILLORS",
    position: "FEMALE_COUNCILLORS",
    expectedPath: "PRIMARIES.CONSTITUENCY_MUNICIPALITY.COUNCILLORS.FEMALE_COUNCILLORS",
    isDirect: false,
    isSubcategoryDirect: true
  },

  // Nested Position Tests
  {
    name: "SIG Committee Youth Chairperson",
    level: "VILLAGE_CELL",
    category: "SIG_COMMITTEE",
    subcategory: "YOUTH",
    position: "CHAIRPERSON",
    expectedPath: "PRIMARIES.VILLAGE_CELL.SIG_COMMITTEE.YOUTH.CHAIRPERSON",
    isDirect: false,
    isSubcategoryDirect: false
  },
  {
    name: "SIG Committee Women Secretary Finance",
    level: "DISTRICT",
    category: "SIG_COMMITTEE",
    subcategory: "WOMEN",
    position: "SECRETARY_FINANCE",
    expectedPath: "PRIMARIES.DISTRICT.SIG_COMMITTEE.WOMEN.SECRETARY_FINANCE",
    isDirect: false,
    isSubcategoryDirect: false
  },
  {
    name: "District SIGS Youth National",
    level: "DISTRICT",
    category: "SIGS",
    subcategory: "YOUTH",
    position: "NATIONAL",
    expectedPath: "PRIMARIES.DISTRICT.SIGS.YOUTH.NATIONAL",
    isDirect: false,
    isSubcategoryDirect: false
  }
];

/**
 * Utility function to build expected position path for testing
 */
export const buildExpectedPositionPath = (candidateData, level) => {
  if (!candidateData.category) return "";
  
  const categoryObj = primariesElectionsConfig?.PRIMARIES?.[level]?.[candidateData.category];
  
  if (categoryObj === null) {
    // Direct position
    return `PRIMARIES.${level}.${candidateData.category}`;
  } else if (candidateData.subcategory) {
    const subcategoryObj = categoryObj?.[candidateData.subcategory];
    
    if (subcategoryObj === null) {
      // Direct subcategory position
      return `PRIMARIES.${level}.${candidateData.category}.${candidateData.subcategory}`;
    } else if (candidateData.position) {
      // Regular nested position
      return `PRIMARIES.${level}.${candidateData.category}.${candidateData.subcategory}.${candidateData.position}`;
    }
  }
  
  return "";
};

/**
 * Function to validate position detection logic
 */
export const validatePositionDetection = (level, category) => {
  const categoryObj = primariesElectionsConfig?.PRIMARIES?.[level]?.[category];
  return {
    isDirect: categoryObj === null,
    hasSubcategories: categoryObj && typeof categoryObj === 'object',
    subcategories: categoryObj && typeof categoryObj === 'object' ? Object.keys(categoryObj) : []
  };
};

/**
 * Function to validate subcategory detection logic  
 */
export const validateSubcategoryDetection = (level, category, subcategory) => {
  const categoryObj = primariesElectionsConfig?.PRIMARIES?.[level]?.[category];
  if (!categoryObj || typeof categoryObj !== 'object') return { isValid: false };
  
  const subcategoryObj = categoryObj[subcategory];
  return {
    isValid: subcategoryObj !== undefined,
    isDirect: subcategoryObj === null,
    hasPositions: subcategoryObj && typeof subcategoryObj === 'object',
    positions: subcategoryObj && typeof subcategoryObj === 'object' ? Object.keys(subcategoryObj) : []
  };
};

/**
 * Run all validation tests
 */
export const runPositionValidationTests = () => {
  console.log("Running position validation tests...");
  
  const results = positionTestCases.map(testCase => {
    const actualPath = buildExpectedPositionPath({
      category: testCase.category,
      subcategory: testCase.subcategory,
      position: testCase.position
    }, testCase.level);
    
    const positionDetection = validatePositionDetection(testCase.level, testCase.category);
    
    const subcategoryDetection = testCase.subcategory ? 
      validateSubcategoryDetection(testCase.level, testCase.category, testCase.subcategory) : 
      null;
    
    const passed = actualPath === testCase.expectedPath && 
                   positionDetection.isDirect === testCase.isDirect;
    
    return {
      ...testCase,
      actualPath,
      positionDetection,
      subcategoryDetection,
      passed,
      errors: passed ? [] : [
        actualPath !== testCase.expectedPath ? `Path mismatch: expected ${testCase.expectedPath}, got ${actualPath}` : null,
        positionDetection.isDirect !== testCase.isDirect ? `Direct detection mismatch: expected ${testCase.isDirect}, got ${positionDetection.isDirect}` : null
      ].filter(Boolean)
    };
  });
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log(`Test Results: ${passedTests}/${totalTests} passed`);
  
  if (passedTests < totalTests) {
    console.log("Failed tests:");
    results.filter(r => !r.passed).forEach(result => {
      console.log(`- ${result.name}:`, result.errors);
    });
  }
  
  return results;
};

// Export for use in other files
export default {
  positionTestCases,
  buildExpectedPositionPath,
  validatePositionDetection,
  validateSubcategoryDetection,
  runPositionValidationTests
};
