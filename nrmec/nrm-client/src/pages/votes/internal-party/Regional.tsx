// Internal Party Regional Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const RegionalVotes = () => {
  return (
    <VotesContainer 
      electionType="INTERNAL_PARTY" 
      level="REGIONAL" 
      title="Regional Level Votes - Internal Party Elections"
    />
  );
};

export default RegionalVotes;
