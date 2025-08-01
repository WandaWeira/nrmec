import React from "react";
import { ThumbsUp, ThumbsDown, Search, X, Info } from "lucide-react";
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
  vote: number;
  isNominated?: boolean; // Changed from 'nominated' to 'isNominated'
  feesPaid?: boolean;  candidate?: {
    id: number;
    firstName: string;
    lastName: string;
    ninNumber: string;
    phoneNumber: string;
    electionType: string;
    gender?: string;
  };
  region?: { id: number; name: string; };
  subregion?: { id: number; name: string; };
  district?: { id: number; name: string; };
  constituencyMunicipality?: { id: number; name: string; };
  subcountyDivision?: { id: number; name: string; };
  parishWard?: { id: number; name: string; };
  villageCell?: { id: number; name: string; };
}

interface GenericNominationsTableProps {
  candidates: CandidateParticipation[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRowClick: (params: any) => void;
  onNominate: (candidate: CandidateParticipation) => void;
  onRemoveNomination: (candidate: CandidateParticipation) => void;
}

const GenericNominationsTable: React.FC<GenericNominationsTableProps> = ({
  candidates,
  isLoading,
  searchTerm,
  onSearchChange,
  onRowClick,
  onNominate,
  onRemoveNomination,
}) => {  // Process candidates to ensure consistent data types
  const processedCandidates = candidates.map(candidate => {
    // Ensure feesPaid is a boolean
    return {
      ...candidate,
      feesPaid: Boolean(candidate.feesPaid)
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
      renderCell: (params) => (
        <div>
          {params.row.candidate?.firstName} {params.row.candidate?.lastName}
        </div>
      ),
    },    {
      field: "level",
      headerName: "Level",
      width: 150,
      sortable: true,
      valueFormatter: (value: any) => {
        if (typeof value === 'string') {
          return value.replace(/_/g, " ");
        }
        return value;
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
      field: "location",
      headerName: "Location",
      width: 200,
      sortable: true,
      renderCell: (params) => {
        const locationElements = [];
        if (params.row.district?.name) {
          locationElements.push(params.row.district.name);
        }
        if (params.row.constituencyMunicipality?.name) {
          locationElements.push(params.row.constituencyMunicipality.name);
        }
        if (params.row.subcountyDivision?.name) {
          locationElements.push(params.row.subcountyDivision.name);
        }
        if (params.row.parishWard?.name) {
          locationElements.push(params.row.parishWard.name);
        }
        if (params.row.villageCell?.name) {
          locationElements.push(params.row.villageCell.name);
        }
        return <div>{locationElements.join(" / ")}</div>;
      },
    },
    {      field: "feesPaid",
      headerName: "Fees Paid",
      width: 120,
      sortable: true,
      renderCell: (params) => {
        // Explicitly handle boolean conversion since we might get string or undefined
        const hasPaid = params.row.feesPaid === true || params.row.feesPaid === "true";
        return (
          <div className={hasPaid ? "text-green-600 font-semibold" : "text-red-600"}>
            {hasPaid ? "Yes" : "No"}
          </div>
        );
      },
    },    {
      field: "nominated",
      headerName: "Nominated",
      width: 120,
      sortable: true,
      renderCell: (params) => (
        <div className={params.row.isNominated ? "text-green-600" : "text-gray-600"}>
          {params.row.isNominated ? "Yes" : "No"}
        </div>
      ),
    },
    {
      field: "action",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (        <div className="flex space-x-2">
          {!params.row.isNominated ? (
            <Tooltip title={params.row.feesPaid ? "Nominate" : "Fees not paid"}>
              <span>
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNominate(params.row);
                  }}
                  disabled={!params.row.feesPaid}
                >
                  <ThumbsUp className="h-5 w-5" />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="Remove Nomination">
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveNomination(params.row);
                }}
              >
                <ThumbsDown className="h-5 w-5" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="View Details">
            <IconButton
              color="info"
              onClick={(e) => {
                e.stopPropagation();
                onRowClick(params);
              }}
            >
              <Info className="h-5 w-5" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="relative">
      <div className="flex items-center mb-4 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search candidates..."
            className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => onSearchChange("")}
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="h-[calc(100vh-20rem)] w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <CustomDataGrid
          rows={filteredCandidates}
          columns={columns}
          loading={isLoading}
          onRowClick={onRowClick}          getRowClassName={(params) => {
            // Standardize nominated and feesPaid status
            const isNominated = params.row.isNominated === true || params.row.isNominated === "true";
            const hasPaid = params.row.feesPaid === true || params.row.feesPaid === "true";
            
            return isNominated 
              ? "bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20" 
              : hasPaid 
                ? "hover:bg-blue-50 dark:hover:bg-blue-900/10" 
                : "bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20";
          }}
        />
      </div>
    </div>
  );
};

export default GenericNominationsTable;
