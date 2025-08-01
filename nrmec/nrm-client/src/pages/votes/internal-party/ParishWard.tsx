// Internal Party Parish/Ward Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const ParishWardVotes = () => {
  return (
    <VotesContainer 
      electionType="INTERNAL_PARTY" 
      level="PARISH_WARD" 
      title="Parish/Ward Level Votes - Internal Party Elections"
    />
  );
};

export default ParishWardVotes;
