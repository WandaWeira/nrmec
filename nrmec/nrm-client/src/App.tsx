import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import Regions from "./pages/administrative-units/Regions";
import Subregions from "./pages/administrative-units/Subregions";
import Districts from "./pages/administrative-units/Districts";
import Users from "./pages/Users";
import CandidateReportPage from "./pages/CandidateReportPage";
import ConstituenciesMunicipalities from "./pages/administrative-units/ConstituenciesMunicipalities";
import SubcountiesDivisions from "./pages/administrative-units/SubcountiesDivisions";
import ParishesWards from "./pages/administrative-units/ParishesWards";
import VillagesCells from "./pages/administrative-units/VillagesCells";
import AdminUnits from "./pages/reports/AdminUnits";
import RegionDetails from "./pages/details/Region";
import SubregionsDetails from "./pages/details/Subregions";
import DistrictDetails from "./pages/details/District";
import ConstitiencyMunicipalityDetails from "./pages/details/ConstitiencyMunicipality";
import SubcountyDivisionDetails from "./pages/details/SubcountyDivision";
import ParishWardDetails from "./pages/details/ParishWard";
import VillageCellDetails from "./pages/details/VillageCell";
import FeeSettingsDashboard from "./pages/Payments/FeeSettingsDashboard";
import ReceivePayments from "./pages/Payments/ReceivePayments";
import PaymentReportDashboard from "./pages/Payments/PaymentReportDashboard";
import EnhancedPaymentReportDashboard from "./pages/Payments/EnhancedPaymentReportDashboard";
import ReportTemplate from "./components/ReportTemplate";
import PollingStations from "./pages/reports/PollingStations";
import Registrars from "./pages/reports/Registrars";

import InternalPartyDistrict from "./pages/internal-party/District";
import InternalPartyConstituencyMunicipality from "./pages/internal-party/ConstituencyMunicipality";
import InternalPartySubcountyDivision from "./pages/internal-party/SubcountyDivision";
import InternalPartyParishWard from "./pages/internal-party/ParishWard";
import InternalPartyVillageCell from "./pages/internal-party/VillageCell";
import InternalPartyNational from "./pages/internal-party/National";

import PrimariesNational from "./pages/primaries/National";
import PrimariesDistrict from "./pages/primaries/District";
import PrimariesConstituencyMunicipality from "./pages/primaries/ConstituencyMunicipality";
import PrimariesSubcountyDivision from "./pages/primaries/SubcountyDivision";
import PrimariesParishWard from "./pages/primaries/ParishWard";
import PrimariesVillageCell from "./pages/primaries/VillageCell";

// Nominations Pages
import NominationsIndex from "./pages/nominations/index";

// Nomination Pages - Primaries
import PrimariesNominationsIndex from "./pages/nominations/primaries";
import PrimariesNationalNominations from "./pages/nominations/primaries/National";
import PrimariesDistrictNominations from "./pages/nominations/primaries/District";
import PrimariesConstituencyMunicipalityNominations from "./pages/nominations/primaries/ConstituencyMunicipality";
import PrimariesSubcountyDivisionNominations from "./pages/nominations/primaries/SubcountyDivision";
import PrimariesParishWardNominations from "./pages/nominations/primaries/ParishWard";
import PrimariesVillageCellNominations from "./pages/nominations/primaries/VillageCell";
import PrimariesNominationsReport from "./pages/nominations/primaries/Report";

// Nomination Pages - Internal Party
import InternalPartyNationalNominations from "./pages/nominations/internal-party/National";
import InternalPartyDistrictNominations from "./pages/nominations/internal-party/District";
import InternalPartyConstituencyMunicipalityNominations from "./pages/nominations/internal-party/ConstituencyMunicipality";
import InternalPartySubcountyDivisionNominations from "./pages/nominations/internal-party/SubcountyDivision";
import InternalPartyParishWardNominations from "./pages/nominations/internal-party/ParishWard";
import InternalPartyVillageCellNominations from "./pages/nominations/internal-party/VillageCell";
import InternalPartyNominationsIndex from "./pages/nominations/internal-party";
import InternalPartyNominationsReport from "./pages/nominations/internal-party/Report";

// Votes Pages
import VotesIndex from "./pages/votes/index";

// Votes Pages - Primaries
import VotesPrimariesIndex from "./pages/votes/primaries";
import VotesPrimariesNational from "./pages/votes/primaries/National";
import VotesPrimariesDistrict from "./pages/votes/primaries/District";
import VotesPrimariesConstituencyMunicipality from "./pages/votes/primaries/ConstituencyMunicipality";
import VotesPrimariesSubcountyDivision from "./pages/votes/primaries/SubcountyDivision";
import VotesPrimariesParishWard from "./pages/votes/primaries/ParishWard";
import VotesPrimariesVillageCell from "./pages/votes/primaries/VillageCell";

// Votes Pages - Internal Party
import VotesInternalPartyIndex from "./pages/votes/internal-party";
import VotesInternalPartyNational from "./pages/votes/internal-party/National";
import VotesInternalPartyDistrict from "./pages/votes/internal-party/District";
import VotesInternalPartyConstituencyMunicipality from "./pages/votes/internal-party/ConstituencyMunicipality";
import VotesInternalPartySubcountyDivision from "./pages/votes/internal-party/SubcountyDivision";
import VotesInternalPartyParishWard from "./pages/votes/internal-party/ParishWard";
import VotesInternalPartyVillageCell from "./pages/votes/internal-party/VillageCell";

// General Elections Pages
import GeneralElectionsContainer from "./components/general-elections/GeneralElectionsContainer";
import GeneralElectionsIndex from "./pages/general-elections/index";
import VillageCellGeneralElections from "./pages/general-elections/VillageCellGeneralElections";
import ParishWardGeneralElections from "./pages/general-elections/ParishWardGeneralElections";
import SubcountyDivisionGeneralElections from "./pages/general-elections/SubcountyDivisionGeneralElections";
import ConstituencyMunicipalityGeneralElections from "./pages/general-elections/ConstituencyMunicipalityGeneralElections";
import DistrictGeneralElections from "./pages/general-elections/DistrictGeneralElections";
import NationalGeneralElections from "./pages/general-elections/NationalGeneralElections";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/candidate-report" element={<CandidateReportPage />} />
          <Route path="/users" element={<Users />} />
          <Route path="/administrative-units/regions" element={<Regions />} />
          <Route
            path="/administrative-units/subregions"
            element={<Subregions />}
          />
          <Route
            path="/administrative-units/districts"
            element={<Districts />}
          />
          <Route
            path="/administrative-units/constituencies"
            element={<ConstituenciesMunicipalities />}
          />
          <Route
            path="/administrative-units/subcounties"
            element={<SubcountiesDivisions />}
          />
          <Route
            path="/administrative-units/parishes"
            element={<ParishesWards />}
          />
          <Route
            path="/administrative-units/villages"
            element={<VillagesCells />}
          />
          <Route
            path="/reports/administrative-units"
            element={<AdminUnits />}
          />{" "}
          <Route
            path="/express-interest/internal-party/district"
            element={<InternalPartyDistrict />}
          />
          <Route
            path="/express-interest/internal-party/constituency-municipality"
            element={<InternalPartyConstituencyMunicipality />}
          />
          <Route
            path="/express-interest/internal-party/subcounty-division"
            element={<InternalPartySubcountyDivision />}
          />
          <Route
            path="/express-interest/internal-party/parish-ward"
            element={<InternalPartyParishWard />}
          />
          <Route
            path="/express-interest/internal-party/village-cell"
            element={<InternalPartyVillageCell />}
          />
          <Route
            path="/express-interest/internal-party/national"
            element={<InternalPartyNational />}
          />
          <Route
            path="/express-interest/primaries/national"
            element={<PrimariesNational />}
          />
          <Route
            path="/express-interest/primaries/district"
            element={<PrimariesDistrict />}
          />
          <Route
            path="/express-interest/primaries/constituency-municipality"
            element={<PrimariesConstituencyMunicipality />}
          />
          <Route
            path="/express-interest/primaries/subcounty-division"
            element={<PrimariesSubcountyDivision />}
          />
          <Route
            path="/express-interest/primaries/parish-ward"
            element={<PrimariesParishWard />}
          />{" "}
          <Route
            path="/express-interest/primaries/village-cell"
            element={<PrimariesVillageCell />}
          />{" "}
          {/* Nominations - Primaries Routes */}
          <Route path="/nominations" element={<NominationsIndex />} />
          <Route
            path="/nominations/primaries"
            element={<PrimariesNominationsIndex />}
          />
          <Route
            path="/nominations/primaries/national"
            element={<PrimariesNationalNominations />}
          />
          <Route
            path="/nominations/primaries/district"
            element={<PrimariesDistrictNominations />}
          />
          <Route
            path="/nominations/primaries/constituency-municipality"
            element={<PrimariesConstituencyMunicipalityNominations />}
          />
          <Route
            path="/nominations/primaries/subcounty-division"
            element={<PrimariesSubcountyDivisionNominations />}
          />
          <Route
            path="/nominations/primaries/parish-ward"
            element={<PrimariesParishWardNominations />}
          />
          <Route
            path="/nominations/primaries/village-cell"
            element={<PrimariesVillageCellNominations />}
          />
          <Route
            path="/nominations/primaries/report"
            element={<PrimariesNominationsReport />}
          />{" "}
          {/* Nominations - Internal Party Routes */}
          <Route
            path="/nominations/internal-party"
            element={<InternalPartyNominationsIndex />}
          />
          <Route
            path="/nominations/internal-party/national"
            element={<InternalPartyNationalNominations />}
          />
          <Route
            path="/nominations/internal-party/district"
            element={<InternalPartyDistrictNominations />}
          />
          <Route
            path="/nominations/internal-party/constituency-municipality"
            element={<InternalPartyConstituencyMunicipalityNominations />}
          />
          <Route
            path="/nominations/internal-party/subcounty-division"
            element={<InternalPartySubcountyDivisionNominations />}
          />
          <Route
            path="/nominations/internal-party/parish-ward"
            element={<InternalPartyParishWardNominations />}
          />{" "}
          <Route
            path="/nominations/internal-party/village-cell"
            element={<InternalPartyVillageCellNominations />}
          />
          <Route
            path="/nominations/internal-party/report"
            element={<InternalPartyNominationsReport />}
          />
          {/* Votes Routes */}
          <Route path="/votes" element={<VotesIndex />} />
          {/* Votes - Primaries Routes */}
          <Route path="/votes/primaries" element={<VotesPrimariesIndex />} />
          <Route
            path="/votes/primaries/national"
            element={<VotesPrimariesNational />}
          />
          <Route
            path="/votes/primaries/district"
            element={<VotesPrimariesDistrict />}
          />
          <Route
            path="/votes/primaries/constituency-municipality"
            element={<VotesPrimariesConstituencyMunicipality />}
          />
          <Route
            path="/votes/primaries/subcounty-division"
            element={<VotesPrimariesSubcountyDivision />}
          />
          <Route
            path="/votes/primaries/parish-ward"
            element={<VotesPrimariesParishWard />}
          />
          <Route
            path="/votes/primaries/village-cell"
            element={<VotesPrimariesVillageCell />}
          />
          {/* Votes - Internal Party Routes */}
          <Route
            path="/votes/internal-party"
            element={<VotesInternalPartyIndex />}
          />
          <Route
            path="/votes/internal-party/national"
            element={<VotesInternalPartyNational />}
          />
          <Route
            path="/votes/internal-party/district"
            element={<VotesInternalPartyDistrict />}
          />
          <Route
            path="/votes/internal-party/constituency-municipality"
            element={<VotesInternalPartyConstituencyMunicipality />}
          />
          <Route
            path="/votes/internal-party/subcounty-division"
            element={<VotesInternalPartySubcountyDivision />}
          />
          <Route
            path="/votes/internal-party/parish-ward"
            element={<VotesInternalPartyParishWard />}
          />
          <Route
            path="/votes/internal-party/village-cell"
            element={<VotesInternalPartyVillageCell />}
          />
          {/* General Elections Routes */}
          <Route
            path="/general-elections"
            element={<GeneralElectionsIndex />}
          />
          <Route
            path="/general-elections/village-cell"
            element={<GeneralElectionsContainer />}
          />
          <Route
            path="/general-elections/parish-ward"
            element={<GeneralElectionsContainer />}
          />
          <Route
            path="/general-elections/subcounty-division"
            element={<GeneralElectionsContainer />}
          />
          <Route
            path="/general-elections/constituency-municipality"
            element={<GeneralElectionsContainer />}
          />
          <Route
            path="/general-elections/district"
            element={<GeneralElectionsContainer />}
          />
          <Route
            path="/general-elections/national"
            element={<GeneralElectionsContainer />}
          />{" "}
          <Route path="/payments/settings" element={<FeeSettingsDashboard />} />
          <Route path="/payments/receive" element={<ReceivePayments />} />
          <Route path="/payments/report" element={<PaymentReportDashboard />} />
          <Route
            path="/payments/enhanced-report"
            element={<EnhancedPaymentReportDashboard />}
          />
          <Route path="/regions/:id" element={<RegionDetails />} />
          <Route path="/subregions/:id" element={<SubregionsDetails />} />
          <Route path="/districts/:id" element={<DistrictDetails />} />
          <Route
            path="/constituencies-municipalities/:id"
            element={<ConstitiencyMunicipalityDetails />}
          />
          <Route
            path="/subcounties-divisions/:id"
            element={<SubcountyDivisionDetails />}
          />
          <Route path="/parishes-wards/:id" element={<ParishWardDetails />} />
          <Route path="/villages-cells/:id" element={<VillageCellDetails />} />
          <Route path="/reports/template" element={<ReportTemplate />} />
          <Route
            path="/reports/polling-stations"
            element={<PollingStations />}
          />
          <Route path="/reports/registrars" element={<Registrars />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
