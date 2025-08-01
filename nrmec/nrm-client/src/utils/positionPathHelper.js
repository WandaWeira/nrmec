// src/utils/positionPathHelper.js
import internalPartyElectionsConfig from "../config/intenal_party_elections_config.json";
import primariesElectionsConfig from "../config/primaries_elections_config.json";

/**
 * Extracts all positions from the configuration files and returns them in a structured format
 * @returns {Object} A object containing all position paths organized by election type and level
 */
export const extractPositionPaths = () => {
  const result = {
    INTERNAL_PARTY: extractPositionsFromConfig(internalPartyElectionsConfig.INTERNAL_PARTY),
    PRIMARIES: extractPositionsFromConfig(primariesElectionsConfig.PRIMARIES)
  };
  return result;
};

/**
 * Recursively extracts positions from a configuration object
 * @param {Object} config The configuration object to extract positions from
 * @param {string} parentPath The parent path to prepend to position paths
 * @returns {Object} An object containing all position paths organized by level
 */
const extractPositionsFromConfig = (config) => {
  const positions = {};
  
  // Process each level
  for (const level in config) {
    positions[level] = [];
    processLevel(config[level], `${level}`, positions[level]);
  }
  
  return positions;
};

/**
 * Recursively processes a level in the configuration
 * @param {Object} levelConfig The configuration object for a level
 * @param {string} currentPath The current path being built
 * @param {Array} positionCollection The array to collect position paths
 */
const processLevel = (levelConfig, currentPath, positionCollection) => {
  // If the value is null, it's a direct position
  if (levelConfig === null) {
    const pathParts = currentPath.split('.');
    const position = {
      path: currentPath,
      category: pathParts.length > 0 ? pathParts[0] : null,
      subcategory: pathParts.length > 1 ? pathParts[1] : null,
      nestedCategory: pathParts.length > 2 ? pathParts[2] : null,
      position: pathParts[pathParts.length - 1]
    };
    positionCollection.push(position);
    return;
  }
  
  // Otherwise, it's an object with nested positions
  for (const key in levelConfig) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    if (levelConfig[key] === null) {
      // This is a direct position
      const pathParts = newPath.split('.');
      const position = {
        path: newPath,
        category: pathParts.length > 0 ? pathParts[0] : null,
        subcategory: pathParts.length > 1 ? pathParts[1] : null,
        nestedCategory: pathParts.length > 2 ? pathParts[2] : null,
        position: key
      };
      positionCollection.push(position);
    } else {
      // This is a nested structure, recurse
      processLevel(levelConfig[key], newPath, positionCollection);
    }
  }
};

/**
 * Builds a position path from individual components
 * @param {Object} components The components to build the path from
 * @returns {string} The constructed position path
 */
export const buildPositionPath = (components) => {
  const { electionType, level, category, subcategory, nestedCategory, position } = components;
  
  let path = electionType;
  if (level) path += `.${level}`;
  if (category) path += `.${category}`;
  if (subcategory) path += `.${subcategory}`;
  if (nestedCategory) path += `.${nestedCategory}`;
  if (position) path += `.${position}`;
  
  return path;
};

/**
 * Extracts components from a position path
 * @param {string} path The position path to parse
 * @returns {Object} The extracted components
 */
export const parsePositionPath = (path) => {
  if (!path) return {};
  
  const parts = path.split('.');
  
  if (parts.length < 2) return { electionType: parts[0] };
  
  return {
    electionType: parts[0],
    level: parts[1],
    category: parts.length > 2 ? parts[2] : null,
    subcategory: parts.length > 3 ? parts[3] : null,
    nestedCategory: parts.length > 4 ? parts[4] : null,
    position: parts.length > 2 ? parts[parts.length - 1] : null
  };
};
