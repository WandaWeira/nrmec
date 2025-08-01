import React, { useState } from "react";
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

interface GenericPrimariesTableProps {
  candidates: CandidateParticipation[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRowClick: (params: any) => void;
  onEdit: (candidate: CandidateParticipation) => void;
  onDelete: (id: number) => void;
}

const GenericPrimariesTable: React.FC<GenericPrimariesTableProps> = ({
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
    { field: "category", headerName: "Election Category", width: 150 },
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
            className="text-gray-600 hover:text-gray-700"
          >
            <Trash size={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  // Transform candidates data for data grid
  const rows = candidates?.map((candidate) => ({
    id: candidate.id,
    ...candidate,
    firstName: candidate.candidate?.firstName || "-",
    lastName: candidate.candidate?.lastName || "-",
    ninNumber: candidate.candidate?.ninNumber || "-",
    phoneNumber: candidate.candidate?.phoneNumber || "-",
    gender: candidate.candidate?.gender || "-",
    regionName: candidate.region?.name || "-",
    subregionName: candidate.subregion?.name || "-",
    districtName: candidate.district?.name || "-",
    constituencyName: candidate.constituencyMunicipality?.name || "-",
    subcountyName: candidate.subcountyDivision?.name || "-",
    parishName: candidate.parishWard?.name || "-",
    villageName: candidate.villageCell?.name || "-",
  })) || [];

  // Filter by search term
  const filteredRows = rows.filter((row) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      row.firstName.toLowerCase().includes(searchLower) ||
      row.lastName.toLowerCase().includes(searchLower) ||
      row.ninNumber.toLowerCase().includes(searchLower) ||
      row.phoneNumber.toLowerCase().includes(searchLower) ||
      row.category.toLowerCase().includes(searchLower) ||
      row.position.toLowerCase().includes(searchLower) ||
      (row.regionName && row.regionName.toLowerCase().includes(searchLower)) ||
      (row.subregionName && row.subregionName.toLowerCase().includes(searchLower)) ||
      (row.districtName && row.districtName.toLowerCase().includes(searchLower)) ||
      (row.constituencyName && row.constituencyName.toLowerCase().includes(searchLower)) ||
      (row.subcountyName && row.subcountyName.toLowerCase().includes(searchLower)) ||
      (row.parishName && row.parishName.toLowerCase().includes(searchLower)) ||
      (row.villageName && row.villageName.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="w-full">
      {/* Search bar */}
      <div className="relative mb-4 w-full md:w-96">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-500" />
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full p-2.5 pl-10 border border-gray-300 rounded-lg bg-white focus:ring-yellow-500 focus:border-yellow-600"
          placeholder="Search candidates..."
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        )}
      </div>

      {/* Data grid */}
      <CustomDataGrid
        rows={filteredRows}
        columns={columns}
        isLoading={isLoading}
        onRowClick={onRowClick}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 20, 50]}
      />
    </div>
  );
};

export default GenericPrimariesTable;
