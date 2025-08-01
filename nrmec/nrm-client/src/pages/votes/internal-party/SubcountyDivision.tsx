// Internal Party Subcounty/Division Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const SubcountyDivisionVotes = () => {
  return (
    <VotesContainer 
      electionType="INTERNAL_PARTY" 
      level="SUBCOUNTY_DIVISION" 
      title="Subcounty/Division Level Votes - Internal Party Elections"
    />
  );
};

export default SubcountyDivisionVotes;
