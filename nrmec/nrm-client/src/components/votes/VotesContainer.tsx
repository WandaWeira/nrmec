import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import Loading from "../Loading";
import VotesFilters from "./VotesFilters";
import GenericVotesTable from "./GenericVotesTable";
import VoteEntryModal from "./VoteEntryModal";
import CandidateDetailsModal from "../CandidateDetailsModal";
import primariesElectionsConfig from "../../config/primaries_elections_config.json";
import internalPartyElectionsConfig from "../../config/intenal_party_elections_config.json";
import { 
  useGetCandidatesForVotingQuery,
  useRecordVoteMutation,
  useDeleteVoteMutation
} from "../../store/api/votes_api";

interface Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  ninNumber: string;
  phoneNumber: string;
  electionType: string;
  gender?: string;
}

interface Vote {
  id?: number;
  candidateParticipationId: number;
  votes: number;
  electionType: string;
  level: string;
  positionPath?: string;
  notes?: string;
  recordedBy?: number;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CandidateParticipation {
  id?: number;
  candidateId?: number;
  electionType: string;
  level: string;
  positionPath?: string;
  category: string;
  position: string;
  regionId?: number;
  subregionId?: number;
  districtId?: number;
  constituencyMunicipalityId?: number;
  subcountyDivisionId?: number;
  parishWardId?: number;
  villageCellId?: number;
  year: number;
  status: string;
  isQualified: boolean;
  isNominated?: boolean;
  feesPaid?: boolean;
  candidate?: Candidate;
  votes?: Vote[];
  region?: { id: number; name: string; };
  subregion?: { id: number; name: string; };
  district?: { id: number; name: string; };
  constituencyMunicipality?: { id: number; name: string; };
  subcountyDivision?: { id: number; name: string; };
  parishWard?: { id: number; name: string; };
  villageCell?: { id: number; name: string; };
}

interface VotesContainerProps {
  electionType: "PRIMARIES" | "INTERNAL_PARTY";
  level: string;
  title: string;
}

const VotesContainer: React.FC<VotesContainerProps> = ({
  electionType,
  level,
  title,
}) => {
  // State management
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<any>({});
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateParticipation | null>(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  // Get the appropriate configuration
  const config = electionType === "PRIMARIES" 
    ? primariesElectionsConfig 
    : internalPartyElectionsConfig;
  
  const levelConfig = config[electionType] ? config[electionType][level] : null;
  const categories = levelConfig ? Object.keys(levelConfig) : [];

  // Build query parameters
  const queryParams = {
    electionType,
    level,
    ...filters,
  };

  // API hooks
  const { 
    data: candidatesData, 
    isLoading, 
    error,
    refetch 
  } = useGetCandidatesForVotingQuery(queryParams);
  
  const [recordVote] = useRecordVoteMutation();
  const [deleteVote] = useDeleteVoteMutation();

  const candidates = candidatesData || [];

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle row click to show candidate details
  const handleRowClick = (params: any) => {
    const candidate = candidates.find((c: any) => c.id === params.id);
    if (candidate) {
      setSelectedCandidate(candidate);
      setIsDetailsModalOpen(true);
    }
  };

  // Handle vote entry
  const handleVoteEntry = (candidate: CandidateParticipation) => {
    setSelectedCandidate(candidate);
    setIsVoteModalOpen(true);
  };

  // Handle vote submission
  const handleVoteSubmission = async (voteData: any) => {
    try {
      await recordVote({
        candidateParticipationId: selectedCandidate!.id!,
        votes: voteData.votes,
        electionType,
        level,
        positionPath: selectedCandidate!.positionPath,
        regionId: selectedCandidate!.regionId,
        subregionId: selectedCandidate!.subregionId,
        districtId: selectedCandidate!.districtId,
        constituencyMunicipalityId: selectedCandidate!.constituencyMunicipalityId,
        subcountyDivisionId: selectedCandidate!.subcountyDivisionId,
        parishWardId: selectedCandidate!.parishWardId,
        villageCellId: selectedCandidate!.villageCellId,
        notes: voteData.notes,
      }).unwrap();

      setSuccessMessage("Vote recorded successfully!");
      setIsVoteModalOpen(false);
      refetch();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Error recording vote:", error);
      setErrorMessage(error.data?.message || "Failed to record vote");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  // Handle vote deletion
  const handleDeleteVote = async (voteId: number) => {
    try {
      await deleteVote({ voteId }).unwrap();
      setSuccessMessage("Vote deleted successfully!");
      refetch();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Error deleting vote:", error);
      setErrorMessage(error.data?.message || "Failed to delete vote");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  // Clear messages when modals are closed
  useEffect(() => {
    if (!isVoteModalOpen && !isDetailsModalOpen) {
      setErrorMessage("");
    }
  }, [isVoteModalOpen, isDetailsModalOpen]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">
            Error loading candidates: {(error as any)?.data?.message || "Unknown error"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">
          Record votes for nominated candidates in {electionType.toLowerCase().replace('_', ' ')} elections
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

      {/* Filters */}
      <VotesFilters
        electionType={electionType}
        level={level}
        categories={categories}
        levelConfig={levelConfig}
        onFilterChange={handleFilterChange}
      />

      {/* Candidates Table */}
      <GenericVotesTable
        candidates={candidates}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onRowClick={handleRowClick}
        onVoteEntry={handleVoteEntry}
        onDeleteVote={handleDeleteVote}
      />

      {/* Vote Entry Modal */}
      {isVoteModalOpen && selectedCandidate && (
        <VoteEntryModal
          candidate={selectedCandidate}
          isOpen={isVoteModalOpen}
          onClose={() => setIsVoteModalOpen(false)}
          onSubmit={handleVoteSubmission}
        />
      )}

      {/* Candidate Details Modal */}
      {isDetailsModalOpen && selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default VotesContainer;
