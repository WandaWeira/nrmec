"use strict";

const fs = require("fs");
const path = require("path");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Read the position fees config file
      const configPath = path.join(
        __dirname,
        "../config/position_fees_config.json"
      );
      const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));

      // Array to store all fees to be created
      const fees = [];

      // Set to track unique position paths to avoid duplicates
      const processedPaths = new Set();

      // Current date for created/updated timestamps
      const now = new Date();

      // Function to get the fee amount from config value
      const getFeeAmount = (configValue) => {
        // If it's a number, use that value; if null, use 0
        return typeof configValue === "number" ? configValue : 0;
      };

      // Process each election type (INTERNAL_PARTY, PRIMARIES)
      Object.keys(configData).forEach((electionType) => {
        // Process each level (VILLAGE_CELL, PARISH_WARD, etc.)
        Object.keys(configData[electionType]).forEach((level) => {
          // Recursively process position hierarchy
          traversePositions(configData[electionType][level], [
            electionType,
            level,
          ]);
        });
      });

      // Helper function to recursively traverse the positions
      function traversePositions(obj, pathSoFar) {
        // If we've reached a leaf node (either null or a number), create a fee entry
        if (obj === null || typeof obj === "number") {
          // Get the parts of the path
          const electionType = pathSoFar[0]; // e.g., INTERNAL_PARTY or PRIMARIES
          const level = pathSoFar[1]; // e.g., DISTRICT, NATIONAL, etc.
          const subType = pathSoFar[pathSoFar.length - 1]; // The position name

          // Create the position path by joining all elements with dots
          const positionPath = pathSoFar.join(".");

          // Check if we've already processed this path to avoid duplicates
          if (processedPaths.has(positionPath)) {
            console.log(`Skipping duplicate path: ${positionPath}`);
            return;
          }

          // Add to our set of processed paths
          processedPaths.add(positionPath);

          // Use the fee from config if it's a number, otherwise use 0 for null values
          const amount = getFeeAmount(obj);

          // Add a category if applicable (usually the third segment if present)
          let category = null;
          if (pathSoFar.length > 3) {
            // For positions like YOUTH.CHAIRPERSON, the YOUTH part is the category
            category = pathSoFar[2];
          }

          // Create the fee record
          fees.push({
            // Omit the ID to let the database auto-increment it
            electionType,
            level,
            subType,
            category,
            position: subType, // Often the position is the same as subType
            positionPath,
            amount,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          });

          return;
        }

        // If this is an object, recurse into its properties
        if (typeof obj === "object" && obj !== null) {
          Object.keys(obj).forEach((key) => {
            traversePositions(obj[key], [...pathSoFar, key]);
          });
        }
      }
      console.log(
        `Generated ${fees.length} fee records from ${processedPaths.size} unique position paths.`
      );

      // If no fees were generated, abort early
      if (fees.length === 0) {
        console.log("No fee records to insert. Aborting.");
        return Promise.resolve();
      }

      // Insert all generated fees into the database in batches of 500 (smaller batches for better error handling)
      const batchSize = 500;
      for (let i = 0; i < fees.length; i += batchSize) {
        const batch = fees.slice(i, i + batchSize);
        try {
          await queryInterface.bulkInsert("Fees", batch);
          console.log(
            `Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
              fees.length / batchSize
            )} (${batch.length} records)`
          );
        } catch (error) {
          console.error(
            `Error inserting batch ${Math.floor(i / batchSize) + 1}:`,
            error.message
          );

          // If there's a duplicate key error, try to insert one by one to skip the duplicates
          if (error.name === "SequelizeUniqueConstraintError") {
            console.log(
              "Attempting to insert records one by one to skip duplicates..."
            );
            for (const fee of batch) {
              try {
                await queryInterface.bulkInsert("Fees", [fee]);
              } catch (subError) {
                if (subError.name === "SequelizeUniqueConstraintError") {
                  console.log(
                    `Skipping duplicate record for path: ${fee.positionPath}`
                  );
                } else {
                  console.error(
                    `Error inserting record for path ${fee.positionPath}:`,
                    subError.message
                  );
                }
              }
            }
          } else {
            // For other errors, re-throw
            throw error;
          }
        }
      }

      console.log("All fee records have been inserted successfully.");
      return Promise.resolve();
    } catch (error) {
      console.error("Error in seeder:", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Delete all fee records
    return queryInterface.bulkDelete("Fees", null, {});
  },
};
