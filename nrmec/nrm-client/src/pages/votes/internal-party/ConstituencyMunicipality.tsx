// Internal Party Constituency/Municipality Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const ConstituencyMunicipalityVotes = () => {
  return (
    <VotesContainer 
      electionType="INTERNAL_PARTY" 
      level="CONSTITUENCY_MUNICIPALITY" 
      title="Constituency/Municipality Level Votes - Internal Party Elections"
    />
  );
};

export default ConstituencyMunicipalityVotes;
