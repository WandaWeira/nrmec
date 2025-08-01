// Primaries Parish/Ward Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const ParishWardVotes = () => {
  return (
    <VotesContainer 
      electionType="PRIMARIES" 
      level="PARISH_WARD" 
      title="Parish/Ward Level Votes - Primaries Elections"
    />
  );
};

export default ParishWardVotes;
