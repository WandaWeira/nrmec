// Primaries Subcounty/Division Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const SubcountyDivisionVotes = () => {
  return (
    <VotesContainer 
      electionType="PRIMARIES" 
      level="SUBCOUNTY_DIVISION" 
      title="Subcounty/Division Level Votes - Primaries Elections"
    />
  );
};

export default SubcountyDivisionVotes;
