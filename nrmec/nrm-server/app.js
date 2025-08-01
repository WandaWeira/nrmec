const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const cors = require("cors");

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

require("dotenv").config();

const db = require("./models");

const userRoutes = require("./routes/User");
app.use("/", userRoutes);

const authRoutes = require("./routes/Auth");
app.use("/auth", authRoutes);

const regionRoutes = require("./routes/Region");
app.use("/regions", regionRoutes);

const subregionRoutes = require("./routes/Subregion");
app.use("/subregions", subregionRoutes);

const districtRoutes = require("./routes/District");
app.use("/districts", districtRoutes);

const constituencyRoutes = require("./routes/ConstituencyMunicipality");
app.use("/constituencies-municipalities", constituencyRoutes);

const divisionRoutes = require("./routes/Division");
app.use("/divisions", divisionRoutes);

const municipalitiesRoutes = require("./routes/Municipality");
app.use("/municipalities", municipalitiesRoutes);

const wardRoutes = require("./routes/Ward");
app.use("/wards", wardRoutes);

const cellRoutes = require("./routes/Cell");
app.use("/cells", cellRoutes);

const subcountyRoutes = require("./routes/SubcountyDivision");
app.use("/subcounty-divisions", subcountyRoutes);

const parishRoutes = require("./routes/ParishWard");
app.use("/parish-wards", parishRoutes);

const villageRoutes = require("./routes/VillageCell");
app.use("/village-cells", villageRoutes);

const ElectoralPositionsRoutes = require("./routes/ElectoralPositionsRoutes");
app.use("/electoral-positions", ElectoralPositionsRoutes);

const PollingStationRoutes = require("./routes/PollingStation");
app.use("/polling-stations", PollingStationRoutes);

const auditTrailRoutes = require("./routes/AuditTrail");
app.use("/audit-trail", auditTrailRoutes);

const pendingActionsRoutes = require("./routes/PendingActions");
app.use("/pending-actions", pendingActionsRoutes);

const statsRoutes = require("./routes/stats");
app.use("/stats", statsRoutes);

const candidateFeesRouter = require("./routes/candidateFeeRoutes");
app.use("/fees", candidateFeesRouter);


const Candidate = require("./routes/Candidate");
app.use("/candidate", Candidate);

const OppositionCandidate = require("./routes/OppositionCandidate");
app.use("/opposition-candidates", OppositionCandidate);

const registrarRoutes = require("./routes/Registrar");
app.use("/registrars", registrarRoutes);


const searchRoutes = require("./routes/GlobalSearch");
app.use("/global", searchRoutes);


// nrm-server/app.js or index.js
const searchRouter = require('./routes/Search');
app.use('/search', searchRouter);

const internalElectionsRoutes = require('./routes/internal_elections_routes');
app.use('/internal-elections', internalElectionsRoutes);

const primariesElectionsRoutes = require('./routes/primaries_elections_routes');
app.use('/primaries-elections', primariesElectionsRoutes);

const nominationsRoutes = require('./routes/nominations_routes');
app.use('/nominations', nominationsRoutes);

const votesRoutes = require('./routes/votes_routes');
app.use('/votes', votesRoutes);

const generalElectionsRoutes = require('./routes/GeneralElections');
app.use('/general-elections', generalElectionsRoutes);

app.use("/test", async (req, res) => {
  res.send("Hello world!--------");
});

db.sequelize.sync().then(() => {
  app.listen(8000, () => {
    console.log("Server is running on port 8000");
  });
});
