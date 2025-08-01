const express = require("express");
const router = express.Router();
const {
  Candidate,
  NationalCandidate,
  VillageCellCandidate,
  ParishesWardsCandidate,
  SubcountiesDivisionsCandidate,
  ConstituencyMunicipalityCandidate,
  DistrictCandidate,
  NationalOppositionCandidate,
  OppositionCandidate,
  DistrictOppositionCandidate,
  ConstituencyMunicipalityOppositionCandidate,
  SubcountiesDivisionsOppositionCandidate,
  ParishesWardsOppositionCandidate,
  VillageCellOppositionCandidate,
} = require("../models");
const { authMiddleware, checkPermission } = require("../middleware/middleware");

// Helper function to create CRUD routes for a model
const createCRUDRoutes = (model, path) => {
  // Create
  router.post(
    `/${path}`,
    authMiddleware,
    checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
    async (req, res) => {
      try {

        const { ninNumber, firstName, lastName, phoneNumber, ...otherData } =
          req.body;

        let candidate;
        const isOppositionModel =
          model === NationalOppositionCandidate ||
          model === DistrictOppositionCandidate ||
          model === ConstituencyMunicipalityOppositionCandidate ||
          model === SubcountiesDivisionsOppositionCandidate ||
          model === ParishesWardsOppositionCandidate ||
          model === VillageCellOppositionCandidate;

        if (isOppositionModel) {
          // Validate required fields
          if (!ninNumber || !firstName || !lastName || !phoneNumber) {
            return res.status(400).json({
              error:
                "Missing required fields: ninNumber, firstName, lastName, phoneNumber",
            });
          }

          try {
            // Create base opposition candidate with all required fields
            candidate = await OppositionCandidate.create({
              ninNumber,
              firstName,
              lastName,
              phoneNumber,
              electionType: "opposition", // Ensure this is always set
            });

            // Create specific opposition candidate type
            const itemData = {
              ...otherData,
              oppositionCandidateId: candidate.id,
              status: req.user.role === "SuperAdmin" ? "approved" : "pending",
              createdBy: req.user.id,
            };

            const item = await model.create(itemData);

            // Return response with all fields
            const response = {
              ...item.toJSON(),
              firstName,
              lastName,
              phoneNumber,
              ninNumber,
            };

            res.status(201).json(response);
          } catch (error) {
            // If the opposition candidate was created but the specific type failed,
            // clean up the opposition candidate
            if (candidate?.id) {
              await OppositionCandidate.destroy({
                where: { id: candidate.id },
              });
            }
            throw error;
          }
        } else {
          // For regular candidates, find or create a Candidate
          [candidate, created] = await Candidate.findOrCreate({
            where: { ninNumber },
            defaults: {
              firstName,
              lastName,
              phoneNumber,
              electionType: "national",
            },
          });

          const item = await model.create({
            ...otherData,
            candidateId: candidate.id,
            status: req.user.role === "SuperAdmin" ? "approved" : "pending",
            createdBy: req.user.id,
          });

          res.status(201).json({
            ...item.toJSON(),
            firstName,
            lastName,
            phoneNumber,
            ninNumber,
          });
        }
      } catch (error) {
        console.error("Error creating candidate:", error);
        console.error("Error stack:", error.stack);
        res.status(400).json({
          error: error.message,
          stack: error.stack, // Remove this in production
        });
      }
    }
  );

  // Read all
  router.get(
    `/${path}`,
    authMiddleware,
    checkPermission("PEO"),
    async (req, res) => {
      try {
        const items = await model.findAll({
          include: [
            {
              model:
                model === NationalOppositionCandidate ||
                model === DistrictOppositionCandidate ||
                model === ConstituencyMunicipalityOppositionCandidate ||
                model === SubcountiesDivisionsOppositionCandidate ||
                model === ParishesWardsOppositionCandidate ||
                model === VillageCellOppositionCandidate
                  ? OppositionCandidate
                  : Candidate,
              attributes: ["firstName", "lastName", "phoneNumber", "ninNumber"],
            },
          ],
        });
        res.json(
          items.map((item) => ({
            ...item.toJSON(),
            firstName:
              item.OppositionCandidate?.firstName ||
              item.Candidate?.firstName ||
              "",
            lastName:
              item.OppositionCandidate?.lastName ||
              item.Candidate?.lastName ||
              "",
            phoneNumber:
              item.OppositionCandidate?.phoneNumber ||
              item.Candidate?.phoneNumber ||
              "",
            ninNumber:
              item.OppositionCandidate?.ninNumber ||
              item.Candidate?.ninNumber ||
              "",
          }))
        );
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Read one
  router.get(
    `/${path}/:id`,
    authMiddleware,
    checkPermission("PEO"),
    async (req, res) => {
      try {
        const item = await model.findByPk(req.params.id, {
          include: [
            {
              model:
                model === NationalOppositionCandidate ||
                model === DistrictOppositionCandidate ||
                model === ConstituencyMunicipalityOppositionCandidate ||
                model === SubcountiesDivisionsOppositionCandidate ||
                model === ParishesWardsOppositionCandidate ||
                model === VillageCellOppositionCandidate
                  ? OppositionCandidate
                  : Candidate,
              attributes: ["firstName", "lastName", "phoneNumber", "ninNumber"],
            },
          ],
        });
        if (item) {
          res.json({
            ...item.toJSON(),
            firstName:
              item.OppositionCandidate?.firstName ||
              item.Candidate?.firstName ||
              "",
            lastName:
              item.OppositionCandidate?.lastName ||
              item.Candidate?.lastName ||
              "",
            phoneNumber:
              item.OppositionCandidate?.phoneNumber ||
              item.Candidate?.phoneNumber ||
              "",
            ninNumber:
              item.OppositionCandidate?.ninNumber ||
              item.Candidate?.ninNumber ||
              "",
          });
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Update
  router.put(
    `/${path}/:id`,
    authMiddleware,
    checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
    async (req, res) => {
      try {
        const item = await model.findByPk(req.params.id);
        if (item) {
          if (req.user.role !== "SuperAdmin" && item.status === "approved") {
            return res
              .status(403)
              .json({ message: "Cannot modify an approved item" });
          }
          const { ninNumber, firstName, lastName, phoneNumber, ...otherData } =
            req.body;

          // Update the associated Candidate or OppositionCandidate
          const candidateModel =
            model === NationalOppositionCandidate ||
            model === DistrictOppositionCandidate ||
            model === ConstituencyMunicipalityOppositionCandidate ||
            model === SubcountiesDivisionsOppositionCandidate ||
            model === ParishesWardsOppositionCandidate ||
            model === VillageCellOppositionCandidate
              ? OppositionCandidate
              : Candidate;
          await candidateModel.update(
            { firstName, lastName, phoneNumber },
            { where: { id: item.candidateId || item.oppositionCandidateId } }
          );

          // Update the specific candidate type
          await item.update({
            ...otherData,
            status: req.user.role === "SuperAdmin" ? "approved" : "pending",
            updatedBy: req.user.id,
          });

          const updatedItem = await model.findByPk(req.params.id, {
            include: [
              {
                model: candidateModel,
                attributes: [
                  "firstName",
                  "lastName",
                  "phoneNumber",
                  "ninNumber",
                ],
              },
            ],
          });

          res.json({
            ...updatedItem.toJSON(),
            firstName:
              updatedItem.OppositionCandidate?.firstName ||
              updatedItem.Candidate?.firstName ||
              "",
            lastName:
              updatedItem.OppositionCandidate?.lastName ||
              updatedItem.Candidate?.lastName ||
              "",
            phoneNumber:
              updatedItem.OppositionCandidate?.phoneNumber ||
              updatedItem.Candidate?.phoneNumber ||
              "",
            ninNumber:
              updatedItem.OppositionCandidate?.ninNumber ||
              updatedItem.Candidate?.ninNumber ||
              "",
          });
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Delete
  router.delete(
    `/${path}/:id`,
    authMiddleware,
    checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
    async (req, res) => {
      try {
        const item = await model.findByPk(req.params.id);
        if (item) {
          if (req.user.role !== "SuperAdmin" && item.status === "approved") {
            return res
              .status(403)
              .json({ message: "Cannot delete an approved item" });
          }
          await item.destroy();
          res.status(204).send();
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Approve an item (SuperAdmin only)
  router.put(
    `/${path}/:id/approve`,
    authMiddleware,
    checkPermission(["SuperAdmin", "DistrictRegistra", "RegionalCoordinator"]),
    async (req, res) => {
      try {
        const item = await model.findByPk(req.params.id);
        if (item) {
          if (req.user.role !== "SuperAdmin" && item.status === "approved") {
            return res
              .status(403)
              .json({ message: "Cannot modify an approved item" });
          }
          const { ninNumber, firstName, lastName, phoneNumber, ...otherData } =
            req.body;

          // Determine if it's an opposition candidate
          const isOppositionCandidate =
            model === NationalOppositionCandidate ||
            model === DistrictOppositionCandidate ||
            model === ConstituencyMunicipalityOppositionCandidate ||
            model === SubcountiesDivisionsOppositionCandidate ||
            model === ParishesWardsOppositionCandidate ||
            model === VillageCellOppositionCandidate;

          // Update the associated Candidate or OppositionCandidate
          const candidateModel = isOppositionCandidate
            ? OppositionCandidate
            : Candidate;
          const candidateIdField = isOppositionCandidate
            ? "oppositionCandidateId"
            : "candidateId";

          if (item[candidateIdField]) {
            await candidateModel.update(
              { firstName, lastName, phoneNumber, ninNumber },
              { where: { id: item[candidateIdField] } }
            );
          } else {
            console.error(`No ${candidateIdField} found for item:`, item);
            return res.status(400).json({
              error: `No associated ${
                isOppositionCandidate ? "OppositionCandidate" : "Candidate"
              } found`,
            });
          }

          // Update the specific candidate type
          await item.update({
            ...otherData,
            status: req.user.role === "SuperAdmin" ? "approved" : "pending",
            updatedBy: req.user.id,
          });

          const updatedItem = await model.findByPk(req.params.id, {
            include: [
              {
                model: candidateModel,
                attributes: [
                  "firstName",
                  "lastName",
                  "phoneNumber",
                  "ninNumber",
                ],
              },
            ],
          });

          if (!updatedItem) {
            return res.status(404).json({ message: "Updated item not found" });
          }

          const associatedCandidate = isOppositionCandidate
            ? updatedItem.OppositionCandidate
            : updatedItem.Candidate;

          if (!associatedCandidate) {
            return res
              .status(404)
              .json({ message: "Associated candidate not found" });
          }

          res.json({
            ...updatedItem.toJSON(),
            firstName: associatedCandidate.firstName || "",
            lastName: associatedCandidate.lastName || "",
            phoneNumber: associatedCandidate.phoneNumber || "",
            ninNumber: associatedCandidate.ninNumber || "",
          });
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      } catch (error) {
        console.error("Error updating candidate:", error);
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Qualify a candidate (SuperAdmin only)
  router.put(
    `/${path}/:id/qualify`,
    authMiddleware,
    checkPermission("SuperAdmin"),
    async (req, res) => {
      try {
        const item = await model.findByPk(req.params.id);
        if (item) {
          await item.update({
            isQualified: req.body.isQualified,
            qualifiedBy: req.user.id,
            qualifiedAt: new Date(),
          });
          res.json(item);
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Get all nominated candidates
  router.get(
    `/${path}/nominated`,
    authMiddleware,
    checkPermission("PEO"),
    async (req, res) => {
      try {
        const items = await model.findAll({
          where: { status: "approved" },
          include: [
            {
              model:
                model === NationalOppositionCandidate ||
                model === DistrictOppositionCandidate ||
                model === ConstituencyMunicipalityOppositionCandidate ||
                model === SubcountiesDivisionsOppositionCandidate ||
                model === ParishesWardsOppositionCandidate ||
                model === VillageCellOppositionCandidate
                  ? OppositionCandidate
                  : Candidate,
              attributes: ["firstName", "lastName", "phoneNumber", "ninNumber"],
            },
          ],
        });
        res.json(
          items.map((item) => ({
            ...item.toJSON(),
            firstName:
              item.OppositionCandidate?.firstName ||
              item.Candidate?.firstName ||
              "",
            lastName:
              item.OppositionCandidate?.lastName ||
              item.Candidate?.lastName ||
              "",
            phoneNumber:
              item.OppositionCandidate?.phoneNumber ||
              item.Candidate?.phoneNumber ||
              "",
            ninNumber:
              item.OppositionCandidate?.ninNumber ||
              item.Candidate?.ninNumber ||
              "",
          }))
        );
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
};

// Create CRUD routes for each model
createCRUDRoutes(Candidate, "candidates");
createCRUDRoutes(OppositionCandidate, "opposition-candidates");
createCRUDRoutes(VillageCellCandidate, "village-cell-candidates");
createCRUDRoutes(NationalCandidate, "national");
createCRUDRoutes(ParishesWardsCandidate, "parishes-wards-candidates");
createCRUDRoutes(
  SubcountiesDivisionsCandidate,
  "subcounties-divisions-candidates"
);
createCRUDRoutes(
  ConstituencyMunicipalityCandidate,
  "constituency-municipality-candidates"
);
createCRUDRoutes(DistrictCandidate, "district-candidates");
createCRUDRoutes(NationalOppositionCandidate, "national-opposition-candidates");
createCRUDRoutes(DistrictOppositionCandidate, "district-opposition-candidates");
createCRUDRoutes(
  ConstituencyMunicipalityOppositionCandidate,
  "constituency-municipality-opposition-candidates"
);
createCRUDRoutes(
  SubcountiesDivisionsOppositionCandidate,
  "subcounties-divisions-opposition-candidates"
);

createCRUDRoutes(
  ParishesWardsOppositionCandidate,
  "parishes-wards-opposition-candidates"
);

createCRUDRoutes(
  VillageCellOppositionCandidate,
  "village-cell-opposition-candidates"
);

module.exports = router;
