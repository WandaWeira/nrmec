// Internal Party Village/Cell Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const VillageCellVotes = () => {
  return (
    <VotesContainer 
      electionType="INTERNAL_PARTY" 
      level="VILLAGE_CELL" 
      title="Village/Cell Level Votes - Internal Party Elections"
    />
  );
};

export default VillageCellVotes;
