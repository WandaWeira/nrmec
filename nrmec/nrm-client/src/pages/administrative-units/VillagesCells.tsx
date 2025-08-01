import { useState, useEffect } from "react";
import {
  useGetVillageCellsQuery,
  useCreateVillageCellMutation,
  useUpdateVillageCellMutation,
  useDeleteVillageCellMutation,
  useGetParishWardsQuery,
  useGetSubcountyDivisionsQuery,
  useGetConstituenciesAndMunicipalitiesQuery,
  useGetDistrictsQuery,
  useGetSubregionsQuery,
  useGetRegionsQuery,
} from "../../store/api/baseApi";
import { AlertCircle, CheckCircle, Edit, Trash } from "lucide-react";
import Loading from "../../components/Loading";
import CustomDataGrid from "../../components/CustomDataGrid";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import { saveAs } from "file-saver";
import { Search } from "lucide-react";

interface VillageCell {
  id: number;
  name: string;
  type: "village" | "cell";
  parishWardId: number;
}

const VillagesCells = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<VillageCell | null>(null);
  const [newEntity, setNewEntity] = useState<Partial<VillageCell>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [operationResult, setOperationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // Pagination state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 2857,
  });
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input to prevent excessive API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const {
    data: entities,
    isLoading,
    isFetching,
    refetch,
  } = useGetVillageCellsQuery({
    page: paginationModel.page + 1, // Convert 0-based to 1-based for API
    limit: paginationModel.pageSize,
    search: debouncedSearchTerm,
    // Make sure to include any other required parameters for your API
    // For example, if you need sorting:
    // sort: sortModel.length > 0 ? sortModel[0].field : undefined,
    // order: sortModel.length > 0 ? sortModel[0].sort : undefined,
  });

  const { data: parishWards } = useGetParishWardsQuery();
  const { data: subcountyDivisions } = useGetSubcountyDivisionsQuery();
  const { data: constituenciesMunicipalities } =
    useGetConstituenciesAndMunicipalitiesQuery();
  const { data: districts } = useGetDistrictsQuery();
  const { data: subregions } = useGetSubregionsQuery();
  const { data: regions } = useGetRegionsQuery();

  const [createEntity] = useCreateVillageCellMutation();
  const [updateEntity] = useUpdateVillageCellMutation();
  const [deleteEntity] = useDeleteVillageCellMutation();

  // Set the total count from the API response
  // Set the total count from the API response
  useEffect(() => {
    if (entities && entities.totalCount) {
      setTotalCount(entities.totalCount);
    }
  }, [entities]);

  // Map the entities with related information
  const enhancedEntities = entities?.villageCells
    ?.map((entity) => {
      const parishWard = parishWards?.find((p) => p.id === entity.parishWardId);
      const subcountyDivision = subcountyDivisions?.find(
        (sd) => sd.id === parishWard?.subcountyDivisionId
      );
      const constituency = constituenciesMunicipalities?.find(
        (c) => c.id === subcountyDivision?.constituencyDivisionId
      );
      const district = districts?.find(
        (d) => d.id === constituency?.districtId
      );
      const subregion = subregions?.find((s) => s.id === district?.subregionId);
      const region = regions?.find((r) => r.id === subregion?.regionId);

      return {
        ...entity,
        parishWardName: parishWard?.name,
        subcountyDivisionName: subcountyDivision?.name,
        constituencyName: constituency?.name,
        districtName: district?.name,
        subregionName: subregion?.name,
        regionName: region?.name,
      };
    }) || [];

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 200 },
    { field: "type", headerName: "Type", width: 130 },
    { field: "parishWardName", headerName: "Parish/Ward", width: 200 },
    {
      field: "subcountyDivisionName",
      headerName: "Subcounty/Division",
      width: 200,
    },
    {
      field: "constituencyName",
      headerName: "Constituency/Municipality",
      width: 200,
    },
    { field: "districtName", headerName: "District", width: 200 },
    { field: "subregionName", headerName: "Subregion", width: 200 },
    { field: "regionName", headerName: "Region", width: 200 },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton
            onClick={() => {
              setEditingEntity(params.row);
              setNewEntity(params.row);
              setIsModalOpen(true);
            }}
            className="text-gray-600 hover:text-gray-700"
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteEntity(params.row.id)}
            className="text-gray-600 hover:text-gray-700"
          >
            <Trash size={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  const handleAddEntity = async () => {
    try {
      await createEntity(newEntity).unwrap();
      setIsModalOpen(false);
      setNewEntity({});
      refetch();
      setOperationResult({
        success: true,
        message: "Entity added successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to add entity",
      });
    }
  };

  const handleUpdateEntity = async () => {
    if (!editingEntity) return;
    try {
      await updateEntity({
        id: editingEntity.id,
        updates: newEntity,
      }).unwrap();
      setIsModalOpen(false);
      setEditingEntity(null);
      setNewEntity({});
      refetch();
      setOperationResult({
        success: true,
        message: "Entity updated successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to update entity",
      });
    }
  };

  const handleDeleteEntity = async (id: number) => {
    try {
      await deleteEntity(id).unwrap();
      refetch();
      setOperationResult({
        success: true,
        message: "Entity deleted successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to delete entity",
      });
    }
  };

  const handleExport = async () => {
    try {
      // Show loading message
      setOperationResult({
        success: true,
        message: "Preparing export, please wait...",
      });

      // Use the /all endpoint instead of query parameter
      const exportResponse = await fetch(
        `/api/villages-cells/all`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!exportResponse.ok) {
        throw new Error('Failed to fetch export data');
      }

      const villageCells = await exportResponse.json();
      
      // Filter the results client-side if search term is provided
      let filteredCells = villageCells;
      if (debouncedSearchTerm) {
        filteredCells = villageCells.filter(entity => 
          entity.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      }
      
      if (!filteredCells || filteredCells.length === 0) {
        setOperationResult({
          success: false,
          message: "No data available to export",
        });
        return;
      }

      const headers = [
        "ID",
        "Name",
        "Type",
        "Parish/Ward",
        "Subcounty/Division",
        "Constituency/Municipality",
        "District",
        "Subregion",
        "Region",
      ];
      
      const csvRows = [];
      csvRows.push(headers.join(","));

      for (const entity of filteredCells) {
        const parishWard = parishWards?.find(
          (p) => p.id === entity.parishWardId
        );
        const subcountyDivision = subcountyDivisions?.find(
          (sd) => sd.id === parishWard?.subcountyDivisionId
        );
        const constituency = constituenciesMunicipalities?.find(
          (c) => c.id === subcountyDivision?.constituencyDivisionId
        );
        const district = districts?.find(
          (d) => d.id === constituency?.districtId
        );
        const subregion = subregions?.find(
          (s) => s.id === district?.subregionId
        );
        const region = regions?.find((r) => r.id === subregion?.regionId);
        
        // CSV escape function to handle commas in values
        const escapeCSV = (val) => {
          if (val === null || val === undefined) return '';
          const str = String(val);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };
        
        const row = [
          entity.id,
          escapeCSV(entity.name),
          entity.type,
          escapeCSV(parishWard?.name || ""),
          escapeCSV(subcountyDivision?.name || ""),
          escapeCSV(constituency?.name || ""),
          escapeCSV(district?.name || ""),
          escapeCSV(subregion?.name || ""),
          escapeCSV(region?.name || "")
        ];
        
        csvRows.push(row.join(","));
      }

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      saveAs(
        blob,
        `villages-cells_${new Date().toISOString().split("T")[0]}.csv`
      );

      setOperationResult({
        success: true,
        message: `${filteredCells.length} records exported successfully`,
      });
    } catch (error) {
      setOperationResult({
        success: false,
        message: "Failed to export data: " + (error.message || "Unknown error"),
      });
    }
  };

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    console.log(`Changing page to ${newModel.page + 1} of ${Math.ceil(totalCount / newModel.pageSize)}`);
    console.log(`Page size: ${newModel.pageSize}, Total records: ${totalCount}`);
    
    // If we're on the last page according to UI, but we know there are more records
    // Let's log that information
    if (newModel.page === Math.ceil(totalCount / newModel.pageSize) - 1) {
      console.log("Reached what UI thinks is the last page");
      if (totalCount === 25 && entities?.totalCount === 71157) {
        console.warn("UI thinks there are only 25 records, but API reported 71157");
        // Force update the total count to the correct value from the API
        setTotalCount(entities.totalCount);
      }
    }
    
    setPaginationModel(newModel);
  };

  if (isLoading && paginationModel.page === 0) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center mb-6 gap-12">
          <h1 className="text-2xl font-semibold text-gray-900">
            Villages and Cells
          </h1>
          <button
            onClick={() => {
              setEditingEntity(null);
              setNewEntity({});
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            <span className="text-xl">+</span> Add New
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 hover:text-gray-800 bg-gray-800 px-4 py-2 rounded-lg text-white"
          >
            <span className="text-lg">↑</span> Export
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
      </div>

      {isFetching && (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      Loading data...
    </div>
  )}

      <CustomDataGrid
        rows={enhancedEntities}
        columns={columns}
        loading={isLoading || isFetching}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[10, 25, 50, 100]}
        rowCount={totalCount}
        checkboxSelection
        paginationMode="server"
        disableRowSelectionOnClick
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">
              {editingEntity ? "Edit Entity" : "Add New Entity"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newEntity.name || ""}
                onChange={(e) =>
                  setNewEntity({ ...newEntity, name: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
              <select
                value={newEntity.type || ""}
                onChange={(e) =>
                  setNewEntity({
                    ...newEntity,
                    type: e.target.value as "village" | "cell",
                  })
                }
                className="border p-2 w-full rounded"
              >
                <option value="">Select Type</option>
                <option value="village">Village</option>
                <option value="cell">Cell</option>
              </select>
              <select
                value={newEntity.parishWardId || ""}
                onChange={(e) =>
                  setNewEntity({
                    ...newEntity,
                    parishWardId: Number(e.target.value),
                  })
                }
                className="border p-2 w-full rounded"
              >
                <option value="">Select Parish/Ward</option>
                {parishWards?.map((parishWard) => (
                  <option key={parishWard.id} value={parishWard.id}>
                    {parishWard.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={editingEntity ? handleUpdateEntity : handleAddEntity}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                >
                  {editingEntity ? "Update" : "Add"}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {operationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <div
              className={`flex items-center ${
                operationResult.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {operationResult.success ? (
                <CheckCircle className="mr-2" />
              ) : (
                <AlertCircle className="mr-2" />
              )}
              <h3 className="text-lg font-bold">
                {operationResult.success ? "Success" : "Error"}
              </h3>
            </div>
            <p className="mt-2">{operationResult.message}</p>
            <button
              onClick={() => setOperationResult(null)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillagesCells;