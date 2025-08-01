const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
  Region,
  Subregion,
  District,
  ConstituencyMunicipality,
  SubcountyDivision,
  ParishWard,
  VillageCell,
  AuditTrail
} = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");

// Search across all administrative units
router.get(
  "/search",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const { term } = req.query;
      console.log("+++++++++>",req.query)
      
      if (!term || term.trim() === "") {
        return res.status(400).json({ message: "Search term is required" });
      }

      const searchTerm = `%${term}%`; // For LIKE queries
      const results = [];
      
      // Log the search for audit purposes
    //   await AuditTrail.create({
    //     actionType: "SEARCH",
    //     entityType: "AdminUnit",
    //     data: JSON.stringify({ searchTerm: term }),
    //     actionBy: req.user.id,
    //     status: "COMPLETED"
    //   });
      
      // Search Regions
      const regions = await Region.findAll({
        where: {
          name: { [Op.like]: searchTerm }
        },
        limit: 5
      });
      
      results.push(...regions.map(region => ({
        id: region.id,
        name: region.name,
        type: "region",
        parentName: null,
        region: region.name
      })));
      
      // Search Subregions with Region info
      const subregions = await Subregion.findAll({
        where: {
          name: { [Op.like]: searchTerm }
        },
        include: [
          { model: Region, as: "region", attributes: ["name"] }
        ],
        limit: 5
      });
      
      results.push(...subregions.map(subregion => ({
        id: subregion.id,
        name: subregion.name,
        type: "subregion",
        parentName: subregion.region ? subregion.region.name : null,
        region: subregion.region ? subregion.region.name : null
      })));
      
      // Search Districts with Subregion and Region info
      const districts = await District.findAll({
        where: {
          name: { [Op.like]: searchTerm }
        },
        include: [
          { 
            model: Subregion, 
            as: "subregion", 
            attributes: ["name"],
            include: [
              { model: Region, as: "region", attributes: ["name"] }
            ]
          }
        ],
        limit: 5
      });
      
      results.push(...districts.map(district => ({
        id: district.id,
        name: district.name,
        type: "district",
        parentName: district.subregion ? district.subregion.name : null,
        district: district.name,
        region: district.subregion && district.subregion.region ? district.subregion.region.name : null
      })));
      
      // Search Constituencies/Municipalities
      const constituenciesMunicipalities = await ConstituencyMunicipality.findAll({
        where: {
          name: { [Op.like]: searchTerm }
        },
        include: [
          { 
            model: District, 
            as: "district", 
            attributes: ["name"],
            include: [
              { 
                model: Subregion, 
                as: "subregion", 
                attributes: ["name"],
                include: [
                  { model: Region, as: "region", attributes: ["name"] }
                ]
              }
            ]
          }
        ],
        limit: 5
      });
      
      results.push(...constituenciesMunicipalities.map(cm => ({
        id: cm.id,
        name: cm.name,
        type: cm.type, // "constituency" or "municipality"
        parentName: cm.district ? cm.district.name : null,
        district: cm.district ? cm.district.name : null,
        region: cm.district && cm.district.subregion && cm.district.subregion.region 
          ? cm.district.subregion.region.name 
          : null
      })));
      
      // Search Subcounties/Divisions
      const subcountiesDivisions = await SubcountyDivision.findAll({
        where: {
          name: { [Op.like]: searchTerm }
        },
        include: [
          { 
            model: ConstituencyMunicipality, 
            as: "constituencyDivision", 
            attributes: ["name", "type"],
            include: [
              { 
                model: District, 
                as: "district", 
                attributes: ["name"],
                include: [
                  { 
                    model: Subregion, 
                    as: "subregion", 
                    attributes: ["name"],
                    include: [
                      { model: Region, as: "region", attributes: ["name"] }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        limit: 5
      });
      
      results.push(...subcountiesDivisions.map(sd => ({
        id: sd.id,
        name: sd.name,
        type: sd.type, // "subcounty" or "division"
        parentName: sd.constituencyDivision ? sd.constituencyDivision.name : null,
        district: sd.constituencyDivision && sd.constituencyDivision.district 
          ? sd.constituencyDivision.district.name 
          : null,
        region: sd.constituencyDivision && sd.constituencyDivision.district && 
                sd.constituencyDivision.district.subregion && 
                sd.constituencyDivision.district.subregion.region 
          ? sd.constituencyDivision.district.subregion.region.name 
          : null
      })));
      
      // Search Parishes/Wards
      const parishesWards = await ParishWard.findAll({
        where: {
          name: { [Op.like]: searchTerm }
        },
        include: [
          { 
            model: SubcountyDivision, 
            as: "subcountyDivision", 
            attributes: ["name", "type"],
            include: [
              { 
                model: ConstituencyMunicipality, 
                as: "constituencyDivision", 
                attributes: ["name", "type"],
                include: [
                  { 
                    model: District, 
                    as: "district", 
                    attributes: ["name"],
                    include: [
                      { 
                        model: Subregion, 
                        as: "subregion", 
                        attributes: ["name"],
                        include: [
                          { model: Region, as: "region", attributes: ["name"] }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        limit: 5
      });
      
      results.push(...parishesWards.map(pw => ({
        id: pw.id,
        name: pw.name,
        type: pw.type, // "parish" or "ward"
        parentName: pw.subcountyDivision ? pw.subcountyDivision.name : null,
        district: pw.subcountyDivision && pw.subcountyDivision.constituencyDivision && 
                  pw.subcountyDivision.constituencyDivision.district 
          ? pw.subcountyDivision.constituencyDivision.district.name 
          : null,
        region: pw.subcountyDivision && pw.subcountyDivision.constituencyDivision && 
                pw.subcountyDivision.constituencyDivision.district && 
                pw.subcountyDivision.constituencyDivision.district.subregion && 
                pw.subcountyDivision.constituencyDivision.district.subregion.region 
          ? pw.subcountyDivision.constituencyDivision.district.subregion.region.name 
          : null
      })));
      
      // Search Villages/Cells
      const villagesCells = await VillageCell.findAll({
        where: {
          name: { [Op.like]: searchTerm }
        },
        include: [
          { 
            model: ParishWard, 
            as: "parishWard", 
            attributes: ["name", "type"],
            include: [
              { 
                model: SubcountyDivision, 
                as: "subcountyDivision", 
                attributes: ["name", "type"],
                include: [
                  { 
                    model: ConstituencyMunicipality, 
                    as: "constituencyDivision", 
                    attributes: ["name", "type"],
                    include: [
                      { 
                        model: District, 
                        as: "district", 
                        attributes: ["name"],
                        include: [
                          { 
                            model: Subregion, 
                            as: "subregion", 
                            attributes: ["name"],
                            include: [
                              { model: Region, as: "region", attributes: ["name"] }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        limit: 10
      });
      
      results.push(...villagesCells.map(vc => ({
        id: vc.id,
        name: vc.name,
        type: vc.type, // "village" or "cell"
        parentName: vc.parishWard ? vc.parishWard.name : null,
        district: vc.parishWard && vc.parishWard.subcountyDivision && 
                  vc.parishWard.subcountyDivision.constituencyDivision && 
                  vc.parishWard.subcountyDivision.constituencyDivision.district 
          ? vc.parishWard.subcountyDivision.constituencyDivision.district.name 
          : null,
        region: vc.parishWard && vc.parishWard.subcountyDivision && 
                vc.parishWard.subcountyDivision.constituencyDivision && 
                vc.parishWard.subcountyDivision.constituencyDivision.district && 
                vc.parishWard.subcountyDivision.constituencyDivision.district.subregion && 
                vc.parishWard.subcountyDivision.constituencyDivision.district.subregion.region 
          ? vc.parishWard.subcountyDivision.constituencyDivision.district.subregion.region.name 
          : null
      })));
      
      // Sort results by relevance
      results.sort((a, b) => {
        // Exact match comes first
        if (a.name.toLowerCase() === term.toLowerCase()) return -1;
        if (b.name.toLowerCase() === term.toLowerCase()) return 1;
        
        // Then names starting with the search term
        const aStartsWith = a.name.toLowerCase().startsWith(term.toLowerCase());
        const bStartsWith = b.name.toLowerCase().startsWith(term.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Otherwise alphabetical
        return a.name.localeCompare(b.name);
      });
      
      // Limit to top 20 most relevant results
      res.json(results.slice(0, 20));
      
    } catch (error) {
      console.error("Error during search:", error);
      res.status(500).json({ 
        message: error.message,
        details: error.errors,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    }
  }
);

// Get specific entity details by type and ID
router.get(
  "/search/:type/:id",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const { type, id } = req.params;
      let entity = null;
      let includes = [];
      
      // Determine model and includes based on type
      switch (type) {
        case "region":
          entity = await Region.findByPk(id, {
            include: [{ model: Subregion, as: "subregions" }]
          });
          break;
          
        case "subregion":
          entity = await Subregion.findByPk(id, {
            include: [
              { model: Region, as: "region" },
              { model: District, as: "districts" }
            ]
          });
          break;
          
        case "district":
          entity = await District.findByPk(id, {
            include: [
              { model: Subregion, as: "subregion" },
              { model: ConstituencyMunicipality, as: "constituenciesMunicipalities" }
            ]
          });
          break;
          
        case "constituency":
        case "municipality":
          entity = await ConstituencyMunicipality.findByPk(id, {
            include: [
              { model: District, as: "district" },
              { model: SubcountyDivision, as: "subcountiesDivisions" }
            ]
          });
          break;
          
        case "subcounty":
        case "division":
          entity = await SubcountyDivision.findByPk(id, {
            include: [
              { model: ConstituencyMunicipality, as: "constituencyDivision" },
              { model: ParishWard, as: "parishesWards" }
            ]
          });
          break;
          
        case "parish":
        case "ward":
          entity = await ParishWard.findByPk(id, {
            include: [
              { model: SubcountyDivision, as: "subcountyDivision" },
              { model: VillageCell, as: "villagesCells" }
            ]
          });
          break;
          
        case "village":
        case "cell":
          entity = await VillageCell.findByPk(id, {
            include: [{ model: ParishWard, as: "parishWard" }]
          });
          break;
          
        default:
          return res.status(400).json({ message: "Invalid entity type" });
      }
      
      if (entity) {
        res.json(entity);
      } else {
        res.status(404).json({ message: `${type} not found` });
      }
    } catch (error) {
      console.error(`Error getting entity:`, error);
      res.status(500).json({ message: error.message });
    }
  }
);



// Add this route to your backend routes file
router.get(
  "/village",
  authMiddleware,
  checkPermission("PEO"),
  async (req, res) => {
    try {
      const { term } = req.query;
      
      if (!term || term.trim() === "") {
        return res.status(400).json({ message: "Search term is required" });
      }

      const searchTerm = `%${term}%`; // For LIKE queries
      
      // Search for Villages/Cells only
      const villagesCells = await VillageCell.findAll({
        where: {
          name: { [Op.like]: searchTerm }
        },
        include: [
          { 
            model: ParishWard, 
            as: "parishWard", 
            attributes: ["id", "name", "type"],
            include: [
              { 
                model: SubcountyDivision, 
                as: "subcountyDivision", 
                attributes: ["id", "name", "type"],
                include: [
                  { 
                    model: ConstituencyMunicipality, 
                    as: "constituencyDivision", 
                    attributes: ["id", "name", "type"],
                    include: [
                      { 
                        model: District, 
                        as: "district", 
                        attributes: ["id", "name"],
                        include: [
                          { 
                            model: Subregion, 
                            as: "subregion", 
                            attributes: ["id", "name"],
                            include: [
                              { model: Region, as: "region", attributes: ["id", "name"] }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        limit: 10
      });
      
      // Format results with all IDs and names for each level
      const results = villagesCells.map(vc => {
        // Extract all the nested data
        const parishWard = vc.parishWard || {};
        const subcountyDivision = parishWard.subcountyDivision || {};
        const constituencyDivision = subcountyDivision.constituencyDivision || {};
        const district = constituencyDivision.district || {};
        const subregion = district.subregion || {};
        const region = subregion.region || {};
        
        return {
          id: vc.id,
          name: vc.name,
          type: vc.type, // "village" or "cell"
          
          // Parish/Ward level
          parishId: parishWard.id,
          parishName: parishWard.name,
          parishType: parishWard.type,
          
          // Subcounty/Division level
          subcountyId: subcountyDivision.id,
          subcountyName: subcountyDivision.name,
          subcountyType: subcountyDivision.type,
          
          // Constituency/Municipality level
          constituencyId: constituencyDivision.id,
          constituencyName: constituencyDivision.name,
          constituencyType: constituencyDivision.type,
          
          // District level
          districtId: district.id,
          districtName: district.name,
          
          // Subregion level
          subregionId: subregion.id,
          subregionName: subregion.name,
          
          // Region level
          regionId: region.id,
          regionName: region.name,
          
          // For display in search results
          parentName: parishWard.name || "",
          district: district.name || "",
          region: region.name || ""
        };
      });
      
      // Sort results by relevance
      results.sort((a, b) => {
        // Exact match comes first
        if (a.name.toLowerCase() === term.toLowerCase()) return -1;
        if (b.name.toLowerCase() === term.toLowerCase()) return 1;
        
        // Then names starting with the search term
        const aStartsWith = a.name.toLowerCase().startsWith(term.toLowerCase());
        const bStartsWith = b.name.toLowerCase().startsWith(term.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Otherwise alphabetical
        return a.name.localeCompare(b.name);
      });
      
      res.json(results);
      
    } catch (error) {
      console.error("Error during village search:", error);
      res.status(500).json({ 
        message: error.message,
        details: error.errors,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    }
  }
);


module.exports = router;