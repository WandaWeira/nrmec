import React from "react";
import { Vote, Trash2, Search, Info } from "lucide-react";
import CustomDataGrid from "../CustomDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";

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
  isNominated?: boolean;
  feesPaid?: boolean;
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
  region?: { id: number; name: string; };
  subregion?: { id: number; name: string; };
  district?: { id: number; name: string; };
  constituencyMunicipality?: { id: number; name: string; };
  subcountyDivision?: { id: number; name: string; };
  parishWard?: { id: number; name: string; };
  villageCell?: { id: number; name: string; };
}

interface GenericVotesTableProps {
  candidates: CandidateParticipation[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  // onRowClick: (params: any) => void; // No longer directly used by CustomDataGrid for this behavior
  onVoteEntry: (candidate: CandidateParticipation) => void;
  onDeleteVote: (voteId: number) => void;
}

const GenericVotesTable: React.FC<GenericVotesTableProps> = ({
  candidates,
  isLoading,
  searchTerm,
  onSearchChange,
  // onRowClick, // No longer directly used
  onVoteEntry,
  onDeleteVote,
}) => {
  // Process candidates to ensure consistent data types
  const processedCandidates = candidates.map(candidate => {
    const totalVotes = candidate.votes?.reduce((sum, vote) => sum + vote.votes, 0) || 0;
    const latestVote = candidate.votes && candidate.votes.length > 0 
      ? candidate.votes[candidate.votes.length - 1] 
      : null;

    return {
      ...candidate,
      feesPaid: Boolean(candidate.feesPaid),
      totalVotes,
      latestVote,
      hasVotes: Boolean(candidate.votes && candidate.votes.length > 0)
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

  const beautifyPositionPath = (path: string | undefined) => {
    if (!path) return "N/A";
    return path.split('/').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' > ');
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full space-x-1">
          {/* Vote Entry Button */}
          <Tooltip title="Record/Update Votes">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click if button is clicked
                onVoteEntry(params.row);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <Vote size={16} />
            </IconButton>
          </Tooltip>

          {/* Delete Vote Button - only show if votes exist */}
          {params.row.hasVotes && params.row.latestVote && (
            <Tooltip title="Delete Latest Vote">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click
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

          {/* Details Button - Kept for now, can be removed if not needed */}
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click
                // Original onRowClick logic can be called here if needed for other details view
                // onRowClick({ id: params.row.id }); 
                console.log("Details for: ", params.row.id); // Placeholder
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              <Info size={16} />
            </IconButton>
          </Tooltip>
        </div>
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
      field: "administrativeUnit",
      headerName: "Administrative Unit",
      width: 200,
      sortable: true,
      valueGetter: (value, row) => {
        if (!row) {
          return "National";
        }
        if (row.villageCell) return row.villageCell.name;
        if (row.parishWard) return row.parishWard.name;
        if (row.subcountyDivision) return row.subcountyDivision.name;
        if (row.constituencyMunicipality) return row.constituencyMunicipality.name;
        if (row.district) return row.district.name;
        if (row.subregion) return row.subregion.name;
        if (row.region) return row.region.name;
        return "National";
      },
    },
    {
      field: "positionPath",
      headerName: "Position Path",
      width: 250,
      sortable: true,
      valueGetter: (value, row) => beautifyPositionPath(row.positionPath),
    },
    // { // This column is removed as per requirement
    //   field: "feesPaid",
    //   headerName: "Fees Paid",
    //   width: 120,
    //   sortable: true,
    //   align: "center",
    //   headerAlign: "center",
    //   renderCell: (params) => (
    //     <div className="flex items-center justify-center h-full">
    //       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
    //         params.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    //       }`}>
    //         {params.value ? 'Paid' : 'Not Paid'}
    //       </span>
    //     </div>
    //   ),
    // },
    // The original "actions" column definition is removed from here as it's moved to the top
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Nominated Candidates ({filteredCandidates.length})
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
        onRowClick={(params) => onVoteEntry(params.row)} // Call onVoteEntry when a row is clicked
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

export default GenericVotesTable;
