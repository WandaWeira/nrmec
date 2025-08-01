// Primaries National Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const NationalVotes = () => {
  return (
    <VotesContainer 
      electionType="PRIMARIES" 
      level="NATIONAL" 
      title="National Level Votes - Primaries Elections"
    />
  );
};

export default NationalVotes;
