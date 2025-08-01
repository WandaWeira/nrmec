// Internal Party National Votes Page

import React from "react";
import { VotesContainer } from "../../../components/votes";

const NationalVotes = () => {
  return (
    <VotesContainer 
      electionType="INTERNAL_PARTY" 
      level="NATIONAL" 
      title="National Level Votes - Internal Party Elections"
    />
  );
};

export default NationalVotes;
