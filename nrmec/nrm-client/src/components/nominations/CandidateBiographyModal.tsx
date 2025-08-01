import React from "react";
import {
  X,
  User,
  MapPin,
  Vote,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  Award,
} from "lucide-react";

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
  isNominated?: boolean;
  feesPaid?: boolean;
  votes?: Array<{
    id: number;
    votes: number;
    notes?: string;
    recordedBy?: number;
    updatedBy?: number;
    createdAt: string;
    updatedAt: string;
  }>;
  candidate?: {
    id: number;
    firstName: string;
    lastName: string;
    ninNumber: string;
    phoneNumber: string;
    electionType: string;
    gender?: string;
    dateOfBirth?: string;
    email?: string;
    address?: string;
    occupation?: string;
  };
  region?: { id: number; name: string };
  subregion?: { id: number; name: string };
  district?: { id: number; name: string };
  constituencyMunicipality?: { id: number; name: string };
  subcountyDivision?: { id: number; name: string };
  parishWard?: { id: number; name: string };
  villageCell?: { id: number; name: string };
}

interface CandidateBiographyModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateParticipation;
}

const CandidateBiographyModal: React.FC<CandidateBiographyModalProps> = ({
  isOpen,
  onClose,
  candidate,
}) => {
  if (!isOpen || !candidate) return null;

  // Debug logging for vote data
  console.log("CandidateBiographyModal - Candidate data:", candidate);
  console.log("CandidateBiographyModal - Votes array:", candidate.votes);
  console.log(
    "CandidateBiographyModal - Vote count calculation:",
    candidate.votes?.reduce((sum, vote) => sum + vote.votes, 0) || 0
  );

  const getAdministrativeHierarchy = () => {
    const hierarchy = [];

    if (candidate.region?.name) {
      hierarchy.push({ level: "Region", name: candidate.region.name });
    }

    if (candidate.subregion?.name) {
      hierarchy.push({ level: "Subregion", name: candidate.subregion.name });
    }

    if (candidate.district?.name) {
      hierarchy.push({ level: "District", name: candidate.district.name });
    }

    if (candidate.constituencyMunicipality?.name) {
      hierarchy.push({
        level: "Constituency/Municipality",
        name: candidate.constituencyMunicipality.name,
      });
    }

    if (candidate.subcountyDivision?.name) {
      hierarchy.push({
        level: "Subcounty/Division",
        name: candidate.subcountyDivision.name,
      });
    }

    if (candidate.parishWard?.name) {
      hierarchy.push({ level: "Parish/Ward", name: candidate.parishWard.name });
    }

    if (candidate.villageCell?.name) {
      hierarchy.push({
        level: "Village/Cell",
        name: candidate.villageCell.name,
      });
    }

    return hierarchy;
  };

  const formatElectionType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatLevel = (level: string) => {
    return level.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const administrativeHierarchy = getAdministrativeHierarchy();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Candidate Biography
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="h-5 w-5" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Full Name
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {candidate.candidate?.firstName}{" "}
                      {candidate.candidate?.lastName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      NIN Number
                    </p>
                    <p className="text-base font-mono text-gray-900 dark:text-white">
                      {candidate.candidate?.ninNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Phone Number
                    </p>
                    <p className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
                      <Phone className="h-4 w-4" />
                      {candidate.candidate?.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {candidate.candidate?.gender && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Gender
                      </p>
                      <p className="text-base text-gray-900 dark:text-white">
                        {candidate.candidate.gender}
                      </p>
                    </div>
                  )}

                  {candidate.candidate?.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Email
                      </p>
                      <p className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
                        <Mail className="h-4 w-4" />
                        {candidate.candidate.email}
                      </p>
                    </div>
                  )}

                  {candidate.candidate?.occupation && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Occupation
                      </p>
                      <p className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
                        <Briefcase className="h-4 w-4" />
                        {candidate.candidate.occupation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Administrative Location Hierarchy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <MapPin className="h-5 w-5" />
                Administrative Location Hierarchy
              </h3>

              <div className="space-y-3">
                {administrativeHierarchy.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {item.level}
                    </span>
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </span>
                  </div>
                ))}

                {administrativeHierarchy.length === 0 && (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No administrative location information available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Electoral Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Vote className="h-5 w-5" />
                Electoral Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Election Type
                    </p>
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                      {formatElectionType(candidate.electionType)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Level
                    </p>
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                      {formatLevel(candidate.level)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Category
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {candidate.category}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Position
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {candidate.position}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Year
                    </p>
                    <p className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
                      <Calendar className="h-4 w-4" />
                      {candidate.year}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Vote Count
                    </p>
                    <p className="text-base font-semibold text-green-600 dark:text-green-400">
                      {candidate.votes?.reduce(
                        (sum, vote) => sum + vote.votes,
                        0
                      ) || 0}{" "}
                      votes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Award className="h-5 w-5" />
                Status Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Fee Payment Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      candidate.feesPaid
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {candidate.feesPaid ? "Paid" : "Not Paid"}
                  </span>
                </div>

                <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Nomination Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      candidate.isNominated
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {candidate.isNominated ? "Nominated" : "Not Nominated"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Position Path */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Position Path
              </p>
              <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded border">
                {candidate.positionPath}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateBiographyModal;
