// Primaries District Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const DistrictVotes = () => {
  return (
    <VotesContainer 
      electionType="PRIMARIES" 
      level="DISTRICT" 
      title="District Level Votes - Primaries Elections"
    />
  );
};

export default DistrictVotes;
