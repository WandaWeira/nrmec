// Primaries Constituency/Municipality Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const ConstituencyMunicipalityVotes = () => {
  return (
    <VotesContainer 
      electionType="PRIMARIES" 
      level="CONSTITUENCY_MUNICIPALITY" 
      title="Constituency/Municipality Level Votes - Primaries Elections"
    />
  );
};

export default ConstituencyMunicipalityVotes;
