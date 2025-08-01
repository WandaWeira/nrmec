// Internal Party District Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const DistrictVotes = () => {
  return (
    <VotesContainer 
      electionType="INTERNAL_PARTY" 
      level="DISTRICT" 
      title="District Level Votes - Internal Party Elections"
    />
  );
};

export default DistrictVotes;
