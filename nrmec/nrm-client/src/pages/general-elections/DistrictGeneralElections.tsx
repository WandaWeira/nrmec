import React, { useState } from "react";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { useGetGeneralElectionCandidates } from "../../store/mutations/generalElectionsMutations";
import GeneralElectionsTable from "../../components/general-elections/GeneralElectionsTable";
import OppositionCandidateForm from "../../components/general-elections/OppositionCandidateForm";
import OppositionCandidatesView from "../../components/general-elections/OppositionCandidatesView";
import VoteEntryForm from "../../components/general-elections/VoteEntryForm";

const DistrictGeneralElections = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [oppositionFormOpen, setOppositionFormOpen] = useState(false);
  const [oppositionViewOpen, setOppositionViewOpen] = useState(false);
  const [voteEntryOpen, setVoteEntryOpen] = useState(false);

  // Fetch candidates with filtering for district level
  const { data: candidates = [], isLoading } = useGetGeneralElectionCandidates({
    level: "DISTRICT",
    electionType: "GENERAL"
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleVoteEntry = (candidate: any) => {
    setSelectedCandidate(candidate);
    setVoteEntryOpen(true);
  };

  const handleAddOpponent = (candidate: any) => {
    setSelectedCandidate(candidate);
    setOppositionFormOpen(true);
  };

  const handleViewOpponents = (candidate: any) => {
    setSelectedCandidate(candidate);
    setOppositionViewOpen(true);
  };

  const handleDeleteVote = (voteId: number) => {
    // This will be handled by the mutation in the Table component
  };

  const closeVoteEntryModal = () => {
    setVoteEntryOpen(false);
  };

  const closeOppositionForm = () => {
    setOppositionFormOpen(false);
  };

  const closeOppositionView = () => {
    setOppositionViewOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        District General Elections
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3, bgcolor: "#f8f9fa" }}>
        <Typography variant="body1">
          Manage general election candidates and their opposition at the District level.
          You can record votes for NRM candidates, add opposition candidates, and record their votes as well.
        </Typography>
      </Paper>
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <GeneralElectionsTable
          candidates={candidates}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onVoteEntry={handleVoteEntry}
          onAddOpponent={handleAddOpponent}
          onViewOpponents={handleViewOpponents}
          onDeleteVote={handleDeleteVote}
        />
      )}
      
      {selectedCandidate && (
        <>
          <VoteEntryForm
            open={voteEntryOpen}
            onClose={closeVoteEntryModal}
            candidate={selectedCandidate}
          />
          
          <OppositionCandidateForm
            open={oppositionFormOpen}
            onClose={closeOppositionForm}
            nrmCandidateParticipation={selectedCandidate}
          />
          
          <OppositionCandidatesView
            open={oppositionViewOpen}
            onClose={closeOppositionView}
            nrmCandidateParticipation={selectedCandidate}
          />
        </>
      )}
    </Box>
  );
};

export default DistrictGeneralElections;
