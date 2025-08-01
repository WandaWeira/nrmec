import React, { useState } from "react";
import { 
  Vote, Trash2, Search, Info, 
  UserPlus, Edit, UserX 
} from "lucide-react";
import CustomDataGrid from "../CustomDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { IconButton, Tooltip, Box } from "@mui/material";

interface GeneralElectionCandidateParticipation {
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
  candidate?: {
    id: number;
    firstName: string;
    lastName: string;
    ninNumber: string;
    phoneNumber: string;
    electionType: string;
    gender?: string;
  };
  votes?: Array<{
    id: number;
    votes: number;
    notes?: string;
    recordedBy?: number;
    updatedBy?: number;
    createdAt: string;
    updatedAt: string;
  }>;
  oppositionCandidates?: Array<{
    id: number;
    oppositionCandidateId: number;
    nrmCandidateParticipationId: number;
    oppositionCandidate: {
      id: number;
      firstName: string;
      lastName: string;
      ninNumber: string;
      phoneNumber: string;
      party: string;
      gender?: string;
    };
    votes?: Array<{
      id: number;
      votes: number;
      notes?: string;
      recordedBy?: number;
      updatedBy?: number;
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
  region?: { id: number; name: string; };
  subregion?: { id: number; name: string; };
  district?: { id: number; name: string; };
  constituencyMunicipality?: { id: number; name: string; };
  subcountyDivision?: { id: number; name: string; };
  parishWard?: { id: number; name: string; };
  villageCell?: { id: number; name: string; };
}

interface GeneralElectionsTableProps {
  candidates: GeneralElectionCandidateParticipation[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onVoteEntry: (candidate: GeneralElectionCandidateParticipation) => void;
  onAddOpponent: (candidate: GeneralElectionCandidateParticipation) => void;
  onViewOpponents: (candidate: GeneralElectionCandidateParticipation) => void;
  onDeleteVote: (voteId: number) => void;
}

const GeneralElectionsTable: React.FC<GeneralElectionsTableProps> = ({
  candidates,
  isLoading,
  searchTerm,
  onSearchChange,
  onVoteEntry,
  onAddOpponent,
  onViewOpponents,
  onDeleteVote,
}) => {
  // Process candidates to ensure consistent data types
  const processedCandidates = candidates.map(candidate => {
    const totalVotes = candidate.votes?.reduce((sum, vote) => sum + vote.votes, 0) || 0;
    const latestVote = candidate.votes && candidate.votes.length > 0 
      ? candidate.votes[candidate.votes.length - 1] 
      : null;
    const oppositionCount = candidate.oppositionCandidates?.length || 0;

    return {
      ...candidate,
      totalVotes,
      latestVote,
      hasVotes: Boolean(candidate.votes && candidate.votes.length > 0),
      oppositionCount
    };
  });
  
  // Filter candidates based on search term
  const filteredCandidates = processedCandidates.filter((candidate) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (candidate.candidate?.firstName?.toLowerCase().includes(searchLower) || 
       candidate.candidate?.lastName?.toLowerCase().includes(searchLower) || 
       candidate.candidate?.ninNumber?.toLowerCase().includes(searchLower) ||
       candidate.candidate?.phoneNumber?.toLowerCase().includes(searchLower) ||
       candidate.position?.toLowerCase().includes(searchLower) ||
       candidate.category?.toLowerCase().includes(searchLower)) ||
       (candidate.district?.name?.toLowerCase().includes(searchLower)) ||
       (candidate.constituencyMunicipality?.name?.toLowerCase().includes(searchLower)) ||
       (candidate.subcountyDivision?.name?.toLowerCase().includes(searchLower)) ||
       (candidate.parishWard?.name?.toLowerCase().includes(searchLower)) ||
       (candidate.villageCell?.name?.toLowerCase().includes(searchLower))
    );
  });

  // Define columns for the data grid
  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box className="flex items-center justify-center h-full space-x-1">
          {/* Vote Entry Button */}
          <Tooltip title="Record/Update Votes">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onVoteEntry(params.row);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <Vote size={16} />
            </IconButton>
          </Tooltip>

          {/* Add Opposition Button */}
          <Tooltip title="Add Opposition Candidate">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onAddOpponent(params.row);
              }}
              className="text-green-600 hover:text-green-800"
            >
              <UserPlus size={16} />
            </IconButton>
          </Tooltip>
          
          {/* View Opposition Button */}
          <Tooltip title="View Opposition Candidates">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onViewOpponents(params.row);
              }}
              className="text-purple-600 hover:text-purple-800"
            >
              <UserX size={16} />
            </IconButton>
          </Tooltip>

          {/* Delete Vote Button - only show if votes exist */}
          {params.row.hasVotes && params.row.latestVote && (
            <Tooltip title="Delete Latest Vote">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Are you sure you want to delete the latest vote record?")) {
                    onDeleteVote(params.row.latestVote.id);
                  }
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      field: "id",
      headerName: "ID",
      width: 70,
      sortable: true,
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
      sortable: true,
      valueGetter: (value, row) => {
        if (!row || !row.candidate) {
          return "N/A";
        }
        const candidate = row.candidate;
        return candidate ? `${candidate.firstName} ${candidate.lastName}` : "N/A";
      },
    },
    {
      field: "ninNumber",
      headerName: "NIN Number",
      width: 150,
      sortable: true,
      valueGetter: (value, row) => {
        if (!row || !row.candidate) {
          return "N/A";
        }
        return row.candidate?.ninNumber || "N/A";
      },
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      width: 150,
      sortable: true,
      valueGetter: (value, row) => {
        if (!row || !row.candidate) {
          return "N/A";
        }
        return row.candidate?.phoneNumber || "N/A";
      },
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      sortable: true,
    },
    {
      field: "position",
      headerName: "Position",
      width: 200,
      sortable: true,
    },
    {
      field: "totalVotes",
      headerName: "Total Votes",
      width: 120,
      sortable: true,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
            params.value > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {params.value || 0}
          </span>
        </div>
      ),
    },
    {
      field: "voteStatus",
      headerName: "Vote Status",
      width: 140,
      sortable: true,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.row.hasVotes
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {params.row.hasVotes ? 'Votes Recorded' : 'No Votes'}
          </span>
        </div>
      ),
    },
    {
      field: "oppositionCount",
      headerName: "Opposition",
      width: 120,
      sortable: true,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value > 0 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {params.value || 0} Candidates
          </span>
        </div>
      ),
    },
    {
      field: "positionPath",
      headerName: "Position Path",
      width: 250,
      sortable: true,
      valueGetter: (value, row) => {
        if (!row || !row.positionPath) {
          return "N/A";
        }
        return row.positionPath.split('.').map(part => {
          return part.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        }).join(' > ');
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            General Elections Candidates ({filteredCandidates.length})
          </h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <CustomDataGrid
        rows={filteredCandidates}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(params) => onVoteEntry(params.row)}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
      />
    </div>
  );
};

export default GeneralElectionsTable;
