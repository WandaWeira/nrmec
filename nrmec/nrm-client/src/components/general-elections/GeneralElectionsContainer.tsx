import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import VillageCellGeneralElections from "../../pages/general-elections/VillageCellGeneralElections";
import ParishWardGeneralElections from "../../pages/general-elections/ParishWardGeneralElections";
import SubcountyDivisionGeneralElections from "../../pages/general-elections/SubcountyDivisionGeneralElections";
import ConstituencyMunicipalityGeneralElections from "../../pages/general-elections/ConstituencyMunicipalityGeneralElections";
import DistrictGeneralElections from "../../pages/general-elections/DistrictGeneralElections";
import NationalGeneralElections from "../../pages/general-elections/NationalGeneralElections";

const GeneralElectionsContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(() => {
    const path = location.pathname;
    if (path.includes("village-cell")) return 0;
    if (path.includes("parish-ward")) return 1;
    if (path.includes("subcounty-division")) return 2;
    if (path.includes("constituency-municipality")) return 3;
    if (path.includes("district")) return 4;
    if (path.includes("national")) return 5;
    return 0; // Default to village-cell
  });

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        navigate("/general-elections/village-cell");
        break;
      case 1:
        navigate("/general-elections/parish-ward");
        break;
      case 2:
        navigate("/general-elections/subcounty-division");
        break;
      case 3:
        navigate("/general-elections/constituency-municipality");
        break;
      case 4:
        navigate("/general-elections/district");
        break;
      case 5:
        navigate("/general-elections/national");
        break;
      default:
        navigate("/general-elections/village-cell");
    }
  };

  const renderContent = () => {
    switch (tabValue) {
      case 0:
        return <VillageCellGeneralElections />;
      case 1:
        return <ParishWardGeneralElections />;
      case 2:
        return <SubcountyDivisionGeneralElections />;
      case 3:
        return <ConstituencyMunicipalityGeneralElections />;
      case 4:
        return <DistrictGeneralElections />;
      case 5:
        return <NationalGeneralElections />;
      default:
        return <VillageCellGeneralElections />;
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="general election levels tabs"
        >
          <Tab label="Village/Cell" />
          <Tab label="Parish/Ward" />
          <Tab label="Subcounty/Division" />
          <Tab label="Constituency/Municipality" />
          <Tab label="District" />
          <Tab label="National" />
        </Tabs>
      </Box>
      <Box sx={{ pt: 2 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default GeneralElectionsContainer;
