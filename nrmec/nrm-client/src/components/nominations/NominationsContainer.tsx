import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import Loading from "../Loading";
import NominationsFilters from "./NominationsFilters";
import GenericNominationsTable from "./GenericNominationsTable";
import NominationFormModal from "./NominationFormModal";
import CandidateBiographyModal from "./CandidateBiographyModal";
import primariesElectionsConfig from "../../config/primaries_elections_config.json";
import internalPartyElectionsConfig from "../../config/intenal_party_elections_config.json";
import {
  useGetCandidatesForNominationQuery,
  useNominateCandidateMutation,
  useRemoveNominationMutation,
} from "../../store/api/nominations_api";
import { useGetPaymentsQuery } from "../../store/api/payments_api";

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  ninNumber: string;
  phoneNumber: string;
  electionType: string;
  gender?: string;
  nominated?: boolean;
}

interface CandidateParticipation {
  id: number;
  candidateId: number;
  electionType: string;
  level: string;
  positionPath: string;
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
  vote: number;
  isNominated?: boolean; // Changed from 'nominated' to 'isNominated'
  feesPaid?: boolean;
  candidate?: Candidate;
  region?: { id: number; name: string };
  subregion?: { id: number; name: string };
  district?: { id: number; name: string };
  constituencyMunicipality?: { id: number; name: string };
  subcountyDivision?: { id: number; name: string };
  parishWard?: { id: number; name: string };
  villageCell?: { id: number; name: string };
}

interface NominationsContainerProps {
  electionType: "PRIMARIES" | "INTERNAL_PARTY";
  level: string; // e.g., "DISTRICT", "CONSTITUENCY_MUNICIPALITY", etc.
}

const NominationsContainer: React.FC<NominationsContainerProps> = ({
  electionType,
  level,
}) => {
  const [adminFilters, setAdminFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateParticipation | null>(null);
  const [operationResult, setOperationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Get candidates and payments data from API
  const queryParams = {
    electionType,
    level,
    ...adminFilters,
  };

  console.log("NominationsContainer API Query Params:", queryParams);

  const {
    data: candidates = [],
    isLoading: isLoadingCandidates,
    refetch: refetchCandidates,
  } = useGetCandidatesForNominationQuery(queryParams);

  // Get payments data to check if candidates have paid
  const { data: payments = [], isLoading: isLoadingPayments } =
    useGetPaymentsQuery({});

  // Mutations
  const [nominateCandidate] = useNominateCandidateMutation();
  const [removeNomination] = useRemoveNominationMutation();

  // Dynamic category/position/subcategory logic based on level and electionType
  const config =
    electionType === "INTERNAL_PARTY"
      ? internalPartyElectionsConfig?.INTERNAL_PARTY
      : primariesElectionsConfig?.PRIMARIES;
  const levelConfig = config?.[level] || {};
  const categories = Object.keys(levelConfig);

  // Computed candidates with fee payment status
  const candidatesWithPaymentStatus = React.useMemo(() => {
    return candidates.map((candidate: CandidateParticipation) => {
      // Check if the candidate has paid fees for this position
      const hasPaid = payments.some((payment: any) => {
        return (
          payment.candidateId === candidate.candidate.ninNumber &&
          payment.positionPath === candidate.positionPath &&
          payment.status === "completed"
        );
      });

      return {
        ...candidate,
        feesPaid: hasPaid,
      };
    });
  }, [candidates, payments]);

  // Filter candidates based on search term

  // Handlers
  const handleNominate = async (candidate: CandidateParticipation) => {
    // First check if candidate has paid
    if (!candidate.feesPaid) {
      setOperationResult({
        success: false,
        message: "Candidate has not paid the required fees for this position",
      });
      setTimeout(() => {
        setOperationResult(null);
      }, 5000);
      return;
    }
    try {
      await nominateCandidate({
        candidateId: candidate.candidateId || candidate.candidate?.id || 0,
        participationId: candidate.id,
        electionType,
        level,
        positionPath: candidate.positionPath,
      }).unwrap();

      setOperationResult({
        success: true,
        message: "Candidate nominated successfully",
      });

      setTimeout(() => {
        setOperationResult(null);
        refetchCandidates();
      }, 3000);
    } catch (error) {
      setOperationResult({
        success: false,
        message: "Failed to nominate candidate",
      });
      setTimeout(() => {
        setOperationResult(null);
      }, 5000);
    }
  };

  const handleRemoveNomination = async (candidate: CandidateParticipation) => {
    if (window.confirm("Are you sure you want to remove this nomination?")) {
      try {
        await removeNomination({
          nominationId: candidate.id,
          electionType,
          level,
        }).unwrap();

        setOperationResult({
          success: true,
          message: "Nomination removed successfully",
        });

        setTimeout(() => {
          setOperationResult(null);
          refetchCandidates();
        }, 3000);
      } catch (error) {
        setOperationResult({
          success: false,
          message: "Failed to remove nomination",
        });
        setTimeout(() => {
          setOperationResult(null);
        }, 5000);
      }
    }
  };

  const handleRowClick = (params: any) => {
    setSelectedCandidate(params.row);
    setIsDetailsModalOpen(true);
  };

  const isLoading = isLoadingCandidates || isLoadingPayments;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">
        {electionType === "INTERNAL_PARTY" ? "Internal Party" : "Primaries"}{" "}
        Nominations - {level.replace(/_/g, " ")}
      </h1>
      {operationResult && (
        <div
          className={`mb-4 p-4 rounded flex items-center text-sm ${
            operationResult.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {operationResult.success ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {operationResult.message}
        </div>
      )}
      <NominationsFilters
        electionType={electionType}
        level={level}
        categories={categories}
        levelConfig={levelConfig}
        onFilterChange={setAdminFilters}
      />
      {isLoading ? (
        <Loading />
      ) : (
        <GenericNominationsTable
          candidates={candidatesWithPaymentStatus}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRowClick={handleRowClick}
          onNominate={handleNominate}
          onRemoveNomination={handleRemoveNomination}
        />
      )}{" "}
      {isDetailsModalOpen && selectedCandidate && (
        <CandidateBiographyModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          candidate={selectedCandidate}
        />
      )}
    </div>
  );
};

export default NominationsContainer;
