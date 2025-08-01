import { useState, useEffect } from "react";
import {
  useGetRegionsQuery,
  useAddRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
} from "../../store/api/baseApi";
import { AlertCircle, CheckCircle, Edit, Trash, X, Search } from "lucide-react";
import Loading from "../../components/Loading";
import CustomDataGrid from "../../components/CustomDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

interface Region {
  id: number;
  name: string;
}

const Regions = () => {
  const { data: regions, isLoading, refetch } = useGetRegionsQuery();
  const [addRegion] = useAddRegionMutation();
  const [updateRegion] = useUpdateRegionMutation();
  const [deleteRegion] = useDeleteRegionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [newRegion, setNewRegion] = useState<Partial<Region>>({});
  const [operationResult, setOperationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // Filter regions based on search term
  const filteredRegions = regions?.filter((region) =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
console.log(regions)
  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (params) => (
        <div
          className="cursor-pointer hover:text-gray-700"
          onClick={() => navigate(`/regions/${params.row.id}`)}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton
            onClick={() => {
              setEditingRegion(params.row);
              setNewRegion(params.row);
              setIsModalOpen(true);
            }}
            className="text-gray-600 hover:text-gray-700"
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteRegion(params.row.id)}
            className="text-gray-600 hover:text-gray-700"
          >
            <Trash size={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  const handleAddRegion = async () => {
    try {
      if (!newRegion.name?.trim()) {
        setOperationResult({
          success: false,
          message: "Region name is required",
        });
        return;
      }
      await addRegion(newRegion).unwrap();
      setIsModalOpen(false);
      setNewRegion({});
      refetch();
      setOperationResult({
        success: true,
        message: "Region added successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to add region",
      });
    }
  };

  const handleUpdateRegion = async () => {
    if (!editingRegion) return;
    try {
      if (!newRegion.name?.trim()) {
        setOperationResult({
          success: false,
          message: "Region name is required",
        });
        return;
      }
      const updatedRegion = { ...editingRegion, ...newRegion };
      await updateRegion(updatedRegion).unwrap();
      setIsModalOpen(false);
      setEditingRegion(null);
      setNewRegion({});
      refetch();
      setOperationResult({
        success: true,
        message: "Region updated successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to update region",
      });
    }
  };

  const handleDeleteRegion = async (id: number) => {
    try {
      await deleteRegion(id).unwrap();
      refetch();
      setOperationResult({
        success: true,
        message: "Region deleted successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to delete region",
      });
    }
  };

  const handleExport = () => {
    try {
      if (!regions || regions.length === 0) {
        setOperationResult({
          success: false,
          message: "No data available to export",
        });
        return;
      }

      // Create CSV headers
      const headers = ["Name"];

      // Convert data to CSV format
      const csvData = regions.map((region) => region.name);

      // Combine headers and data
      const csvContent = [headers.join(","), ...csvData].join("\n");

      // Create blob and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `regions_${new Date().toISOString().split("T")[0]}.csv`);

      setOperationResult({
        success: true,
        message: "Regions exported successfully",
      });
    } catch (error) {
      setOperationResult({
        success: false,
        message: "Failed to export regions",
      });
    }
  };

  // Show operation result notification
  useEffect(() => {
    if (operationResult) {
      const timer = setTimeout(() => {
        setOperationResult(null);
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [operationResult]);

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center mb-6 gap-12">
          <h1 className="text-2xl font-semibold text-gray-900">Regions</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            <span className="text-xl">+</span> Add Region
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
          placeholder="Search region"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
      </div>

      <CustomDataGrid
        rows={filteredRegions || []}
        columns={columns}
        loading={isLoading}
        pageSize={10}
        checkboxSelection
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2"
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingRegion ? "Edit Region" : "Add Region"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Region Name"
                value={newRegion.name || ""}
                onChange={(e) =>
                  setNewRegion({ ...newRegion, name: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={editingRegion ? handleUpdateRegion : handleAddRegion}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                {editingRegion ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operation Result Toast */}
      {operationResult && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
            operationResult.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {operationResult.success ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{operationResult.message}</span>
        </div>
      )}
    </div>
  );
};

export default Regions;
