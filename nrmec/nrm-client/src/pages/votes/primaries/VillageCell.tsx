// Primaries Village/Cell Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const VillageCellVotes = () => {
  return (
    <VotesContainer 
      electionType="PRIMARIES" 
      level="VILLAGE_CELL" 
      title="Village/Cell Level Votes - Primaries Elections"
    />
  );
};

export default VillageCellVotes;
