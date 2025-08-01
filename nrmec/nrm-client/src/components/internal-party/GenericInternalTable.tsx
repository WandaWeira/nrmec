import React from "react";
import { Edit, Trash, Search, X } from "lucide-react";
import CustomDataGrid from "../CustomDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";

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
  candidate?: {
    id: number;
    firstName: string;
    lastName: string;
    ninNumber: string;
    phoneNumber: string;
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

interface GenericInternalTableProps {
  candidates: CandidateParticipation[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRowClick: (params: any) => void;
  onEdit: (candidate: CandidateParticipation) => void;
  onDelete: (id: number) => void;
}

const GenericInternalTable: React.FC<GenericInternalTableProps> = ({
  candidates,
  isLoading,
  searchTerm,
  onSearchChange,
  onRowClick,
  onEdit,
  onDelete
}) => {
  const columns: GridColDef[] = [
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    { field: "ninNumber", headerName: "NIN", width: 150 },
    { field: "phoneNumber", headerName: "Phone", width: 150 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "category", headerName: "League/Committee", width: 150 },
    { field: "position", headerName: "Position", width: 150 },
    { field: "regionName", headerName: "Region", width: 150 },
    { field: "subregionName", headerName: "Subregion", width: 150 },
    { field: "districtName", headerName: "District", width: 150 },
    { field: "constituencyName", headerName: "Constituency/Municipality", width: 200 },
    { field: "subcountyName", headerName: "Subcounty/Division", width: 200 },
    { field: "parishName", headerName: "Parish/Ward", width: 150 },
    { 
      field: "villageName", 
      headerName: "Village/Cell", 
      width: 150,
      renderCell: (params) => (
        params.row.villageCell?.name || "-"
      )
    },
    {
      field: "actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onEdit(params.row);
            }}
            className="text-gray-600 hover:text-gray-700"
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete(params.row.id);
            }}
            className="text-red-500 hover:text-red-600"
          >
            <Trash size={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  // Transform candidate data for the grid
  const rows = candidates?.map((participation) => ({
    id: participation.id,
    firstName: participation.candidate?.firstName || "",
    lastName: participation.candidate?.lastName || "",
    ninNumber: participation.candidate?.ninNumber || "",
    phoneNumber: participation.candidate?.phoneNumber || "",
    gender: participation.candidate?.gender || "",
    category: participation.category,
    position: participation.position,
    regionName: participation.region?.name || "",
    subregionName: participation.subregion?.name || "",
    districtName: participation.district?.name || "",
    constituencyName: participation.constituencyMunicipality?.name || "",
    subcountyName: participation.subcountyDivision?.name || "",
    parishName: participation.parishWard?.name || "",
    villageCell: participation.villageCell,
    ...participation,
  })) || [];
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Candidates</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search candidates..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search size={18} />
          </div>
          {searchTerm && (
            <button
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={() => onSearchChange("")}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <CustomDataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        onRowClick={onRowClick}
        autoHeight
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
      />
    </div>
  );
};

export default GenericInternalTable;
