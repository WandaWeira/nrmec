"use strict";

const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");

// Reusing your helper functions from lines 8-16
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const safeTrim = (value) => (value ? String(value).trim() : "");

// Helper to carry forward empty values
const processDataWithCarryForward = (data) => {
  let currentValues = {};
  return data.map((row) => {
    const processedRow = {};
    Object.keys(row).forEach((key) => {
      if (!row[key]) {
        processedRow[key] = currentValues[key] || "";
      } else {
        processedRow[key] = row[key];
        currentValues[key] = row[key];
      }
    });
    return processedRow;
  });
};

// Add this new helper function
const bulkInsertInChunks = async (
  queryInterface,
  tableName,
  data,
  chunkSize = 100
) => {
  const chunks = chunkArray(data, chunkSize);
  for (const chunk of chunks) {
    await queryInterface.bulkInsert(tableName, chunk, {
      ignoreDuplicates: true,
    });
  }
};

// Helper function to remove consecutive duplicates while preserving duplicates in different locations
const removeConsecutiveDuplicates = (array, keyFn) => {
  return array.filter((item, index, arr) => {
    if (index === 0) return true;
    return keyFn(item) !== keyFn(arr[index - 1]);
  });
};

// Helper function to validate and log missing relationships
const validateHierarchy = (data) => {
  const issues = [];
  data.forEach((row, index) => {
    if (!row.constituency && !row.municipality) {
      issues.push(
        `Row ${index + 1}: District ${
          row.district
        } has no constituency/municipality`
      );
    }
    if (
      (row.constituency || row.municipality) &&
      !row.subcounty &&
      !row.division
    ) {
      issues.push(
        `Row ${index + 1}: Constituency/Municipality ${
          row.constituency || row.municipality
        } has no subcounty/division`
      );
    }
    if ((row.subcounty || row.division) && !row.parish && !row.ward) {
      issues.push(
        `Row ${index + 1}: Subcounty/Division ${
          row.subcounty || row.division
        } has no parish/ward`
      );
    }
    if ((row.parish || row.ward) && !row.village && !row.cell) {
      issues.push(
        `Row ${index + 1}: Parish/Ward ${
          row.parish || row.ward
        } has no village/cell`
      );
    }
  });
  return issues;
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const dataDir = path.join(__dirname, "../data/data");
      const files = fs
        .readdirSync(dataDir)
        .filter((file) => /\.(xlsx|xls|csv)$/i.test(file));

      let allData = [];

      // Read and combine all files
      for (const file of files) {
        console.log(`Reading file: ${file}`);
        let rawData;

        if (file.toLowerCase().endsWith(".csv")) {
          const csvData = fs.readFileSync(path.join(dataDir, file), "utf8");
          const workbook = xlsx.read(csvData, { type: "string" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          rawData = xlsx.utils.sheet_to_json(worksheet);
        } else {
          const workbook = xlsx.readFile(path.join(dataDir, file));
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          rawData = xlsx.utils.sheet_to_json(worksheet);
        }

        // Process data with carry forward
        const processedData = processDataWithCarryForward(rawData);
        allData = [...allData, ...processedData];
      }

      // Clean and standardize data
      const cleanData = allData
        .map((row) => ({
          region: safeTrim(row.Regions || row.Region),
          subregion: safeTrim(row.Subregions || row.Subregion),
          district: safeTrim(row.Districts || row.District),
          hasCity: safeTrim(row.hasCity)?.toUpperCase() === "YES",
          constituency: safeTrim(row.Constituencies || row.Constituency),
          municipality: safeTrim(row.Municipality),
          subcounty: safeTrim(row.Subcounties || row.Subcounty),
          division: safeTrim(row.Divisions || row.Division),
          parish: safeTrim(row.Parishes || row.Parish),
          ward: safeTrim(row.Wards || row.Ward),
          village: safeTrim(row.Villages || row.Village),
          cell: safeTrim(row.Cells || row.Cell),
        }))
        .filter((row) => row.region); // Ensure region exists

      // Insert unique regions
      const uniqueRegions = [...new Set(cleanData.map((row) => row.region))];
      const regions = uniqueRegions.map((name) => ({
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryInterface.bulkInsert("Regions", regions, {
        ignoreDuplicates: true,
      });

      // Get inserted regions
      const dbRegions = await queryInterface.sequelize.query(
        "SELECT * FROM Regions",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Create region mapping
      const regionMap = new Map(
        dbRegions.map((r) => [r.name.toLowerCase(), r.id])
      );

      // Insert unique subregions
      const uniqueSubregions = [
        ...new Set(
          cleanData
            .filter((row) => row.subregion)
            .map((row) => `${row.region}|${row.subregion}`)
        ),
      ].map((combined) => {
        const [region, subregion] = combined.split("|");
        return {
          name: subregion,
          regionId: regionMap.get(region.toLowerCase()),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      await queryInterface.bulkInsert("Subregions", uniqueSubregions, {
        ignoreDuplicates: true,
      });

      // Get inserted subregions
      const dbSubregions = await queryInterface.sequelize.query(
        "SELECT * FROM Subregions",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Create subregion mapping
      const subregionMap = new Map(
        dbSubregions.map((sr) => [
          `${sr.regionId}|${sr.name.toLowerCase()}`,
          sr.id,
        ])
      );

      // Insert unique districts
      const uniqueDistricts = [
        ...new Set(
          cleanData
            .filter((row) => row.district)
            .map(
              (row) =>
                `${regionMap.get(row.region.toLowerCase())}|${row.subregion}|${
                  row.district
                }`
            )
        ),
      ].map((combined) => {
        const [regionId, subregion, district] = combined.split("|");
        const subregionId = subregionMap.get(
          `${regionId}|${subregion.toLowerCase()}`
        );
        return {
          name: district,
          subregionId,
          hasCity:
            cleanData.find((row) => row.district === district)?.hasCity ||
            false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      await queryInterface.bulkInsert("Districts", uniqueDistricts, {
        ignoreDuplicates: true,
      });

      // Get inserted districts
      const dbDistricts = await queryInterface.sequelize.query(
        "SELECT * FROM Districts",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Create district mapping
      const districtMap = new Map(
        dbDistricts.map((d) => [
          `${d.subregionId}|${d.name.toLowerCase()}`,
          d.id,
        ])
      );

      // Insert constituency-municipality pairs
      const constituencyMunicipalities = removeConsecutiveDuplicates(
        cleanData
          .filter((row) => row.constituency || row.municipality)
          .map((row) => {
            const subregionId = subregionMap.get(
              `${regionMap.get(
                row.region.toLowerCase()
              )}|${row.subregion.toLowerCase()}`
            );
            const districtId = districtMap.get(
              `${subregionId}|${row.district.toLowerCase()}`
            );

            return {
              name: row.constituency || row.municipality,
              type: row.constituency ? "constituency" : "municipality",
              districtId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }),
        (item) => `${item.name}|${item.districtId}`
      );

      // Insert constituency-municipality pairs in chunks
      await bulkInsertInChunks(
        queryInterface,
        "ConstituencyMunicipality",
        constituencyMunicipalities
      );

      // Get inserted constituency-municipalities
      const dbConstMuni = await queryInterface.sequelize.query(
        "SELECT * FROM ConstituencyMunicipality",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Create constituency-municipality mapping
      const constMuniMap = new Map(
        dbConstMuni.map((cm) => [
          `${cm.districtId}|${cm.name.toLowerCase()}`,
          cm.id,
        ])
      );

      // Insert subcounty-division pairs
      const subcountyDivisions = removeConsecutiveDuplicates(
        cleanData
          .filter((row) => row.subcounty || row.division)
          .map((row) => {
            const subregionId = subregionMap.get(
              `${regionMap.get(
                row.region.toLowerCase()
              )}|${row.subregion.toLowerCase()}`
            );
            const districtId = districtMap.get(
              `${subregionId}|${row.district.toLowerCase()}`
            );
            const constMuniId = constMuniMap.get(
              `${districtId}|${(
                row.constituency || row.municipality
              ).toLowerCase()}`
            );

            return {
              name: row.subcounty || row.division,
              type: row.subcounty ? "subcounty" : "division",
              constituencyDivisionId: constMuniId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }),
        (item) => `${item.name}|${item.constituencyDivisionId}`
      );

      // Insert subcounty-division pairs in chunks
      await bulkInsertInChunks(
        queryInterface,
        "SubcountyDivision",
        subcountyDivisions
      );

      // Get inserted subcounty-divisions
      const dbSubDiv = await queryInterface.sequelize.query(
        "SELECT * FROM SubcountyDivision",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Create subcounty-division mapping
      const subDivMap = new Map(
        dbSubDiv.map((sd) => [
          `${sd.constituencyDivisionId}|${sd.name.toLowerCase()}`,
          sd.id,
        ])
      );

      // Insert parish-ward pairs
      const parishWards = removeConsecutiveDuplicates(
        cleanData
          .filter((row) => row.parish || row.ward)
          .map((row) => {
            const subregionId = subregionMap.get(
              `${regionMap.get(
                row.region.toLowerCase()
              )}|${row.subregion.toLowerCase()}`
            );
            const districtId = districtMap.get(
              `${subregionId}|${row.district.toLowerCase()}`
            );
            const constMuniId = constMuniMap.get(
              `${districtId}|${(
                row.constituency || row.municipality
              ).toLowerCase()}`
            );
            const subDivId = subDivMap.get(
              `${constMuniId}|${(row.subcounty || row.division).toLowerCase()}`
            );

            return {
              name: row.parish || row.ward,
              type: row.parish ? "parish" : "ward",
              subcountyDivisionId: subDivId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }),
        (item) => `${item.name}|${item.subcountyDivisionId}`
      );

      // Insert parish-ward pairs in chunks
      await bulkInsertInChunks(queryInterface, "ParishWard", parishWards);

      // Get inserted parish-wards
      const dbParishWard = await queryInterface.sequelize.query(
        "SELECT * FROM ParishWard",
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Create parish-ward mapping
      const parishWardMap = new Map(
        dbParishWard.map((pw) => [
          `${pw.subcountyDivisionId}|${pw.name.toLowerCase()}`,
          pw.id,
        ])
      );

      // Insert village-cell pairs
      const villageCells = removeConsecutiveDuplicates(
        cleanData
          .filter((row) => row.village || row.cell)
          .map((row) => {
            const subregionId = subregionMap.get(
              `${regionMap.get(
                row.region.toLowerCase()
              )}|${row.subregion.toLowerCase()}`
            );
            const districtId = districtMap.get(
              `${subregionId}|${row.district.toLowerCase()}`
            );
            const constMuniId = constMuniMap.get(
              `${districtId}|${(
                row.constituency || row.municipality
              ).toLowerCase()}`
            );
            const subDivId = subDivMap.get(
              `${constMuniId}|${(row.subcounty || row.division).toLowerCase()}`
            );
            const parishWardId = parishWardMap.get(
              `${subDivId}|${(row.parish || row.ward).toLowerCase()}`
            );

            return {
              name: row.village || row.cell,
              type: row.village ? "village" : "cell",
              parishWardId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }),
        (item) => `${item.name}|${item.parishWardId}`
      );

      // Insert village-cell pairs in chunks
      await bulkInsertInChunks(queryInterface, "VillageCell", villageCells);

      console.log("Seeding completed successfully");
    } catch (error) {
      console.error("Seeding failed:", error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Delete in reverse order of dependencies
    await queryInterface.bulkDelete("VillageCell", null, {});
    await queryInterface.bulkDelete("ParishWard", null, {});
    await queryInterface.bulkDelete("SubcountyDivision", null, {});
    await queryInterface.bulkDelete("ConstituencyMunicipality", null, {});
    await queryInterface.bulkDelete("Districts", null, {});
    await queryInterface.bulkDelete("Subregions", null, {});
    await queryInterface.bulkDelete("Regions", null, {});
  },
};
