// nrm-client/src/pages/reports/Registrars.tsx
import { useState } from "react";
import {
  useGetRegistrarsQuery,
  useCreateRegistrarMutation,
  useUpdateRegistrarMutation,
} from "../../store/api/registrars_api";
import CustomDataGrid from "../../components/CustomDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import Loading from "../../components/Loading";
import RegistrarForm from "../../components/RegistrarForm";
import { Plus, Edit2 } from "lucide-react";

// Add interface for filters
interface Filters {
  administrativeUnitType: string;
  isActive: string;
  startDate: string;
  endDate: string;
}

// Add interface for Registrar
interface Registrar {
  id: string | number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  ninNumber: string;
  administrativeUnitType: string;
  isActive: boolean;
  ConstituencyMunicipality?: { name: string };
  ParishWard?: { name: string };
  SubcountyDivision?: { name: string };
  VillageCell?: { name: string };
}

const Registrars = () => {
  const [filters, setFilters] = useState<Filters>({
    administrativeUnitType: "",
    isActive: "",
    startDate: "",
    endDate: "",
  });

  const { data: registrars = [], isLoading } = useGetRegistrarsQuery();

  const filteredRegistrars = registrars.filter((registrar) => {
    const matchesUnitType =
      !filters.administrativeUnitType ||
      registrar.administrativeUnitType === filters.administrativeUnitType;

    const matchesStatus =
      !filters.isActive || registrar.isActive.toString() === filters.isActive;

    // Add date filtering if needed
    // const startDate = filters.startDate ? new Date(filters.startDate) : null;
    // const endDate = filters.endDate ? new Date(filters.endDate) : null;

    return matchesUnitType && matchesStatus;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRegistrar, setSelectedRegistrar] = useState<Registrar | null>(
    null
  );

  const [createRegistrar] = useCreateRegistrarMutation();
  const [updateRegistrar] = useUpdateRegistrarMutation();

  const handleAdd = () => {
    setSelectedRegistrar(null);
    setIsFormOpen(true);
  };

  const handleEdit = (registrar: Registrar) => {
    setSelectedRegistrar(registrar);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedRegistrar) {
        await updateRegistrar({ id: selectedRegistrar.id, ...data }).unwrap();
      } else {
        await createRegistrar(data).unwrap();
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving registrar:", error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (params: any) => {
        if (!params?.row) return "";
        const firstName = params.row.firstName || "";
        const lastName = params.row.lastName || "";
        return `${firstName} ${lastName}`.trim();
      },
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      width: 150,
      renderCell: (params: any) => params?.row?.phoneNumber || "",
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      renderCell: (params: any) => params?.row?.email || "",
    },
    {
      field: "ninNumber",
      headerName: "NIN",
      width: 150,
      renderCell: (params: any) => params?.row?.ninNumber || "",
    },
    {
      field: "administrativeUnit",
      headerName: "Administrative Unit",
      width: 300,
      renderCell: (params: any) => {
        if (!params?.row) return "";

        const unitType = params.row.administrativeUnitType;
        let unitName = "";

        switch (unitType) {
          case "constituency":
            unitName = params.row.ConstituencyMunicipality?.name;
            break;
          case "parish":
            unitName = params.row.ParishWard?.name;
            break;
          case "subcounty":
            unitName = params.row.SubcountyDivision?.name;
            break;
          case "village":
            unitName = params.row.VillageCell?.name;
            break;
        }

        return `${unitType?.charAt(0)?.toUpperCase()}${
          unitType?.slice(1) || ""
        }: ${unitName || "N/A"}`;
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: any) => {
        if (!params?.row) return "";
        return params.row.isActive ? "Active" : "Inactive";
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params: any) => {
        if (!params?.row) return null;
        return (
          <button
            onClick={() => handleEdit(params.row)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Edit2 className="w-5 h-5 text-gray-600" />
          </button>
        );
      },
    },
  ];


  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Registrars</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Registrar
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={filters.administrativeUnitType}
          onChange={(e) =>
            setFilters({ ...filters, administrativeUnitType: e.target.value })
          }
          className="border p-2 rounded"
        >
          <option value="">All Unit Types</option>
          <option value="village">Village/Cell</option>
          <option value="parish">Parish/Ward</option>
          <option value="subcounty">Subcounty/Division</option>
          <option value="constituency">Constituency/Municipality</option>
        </select>

        <select
          value={filters.isActive}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="border p-2 rounded"
          placeholder="Start Date"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="border p-2 rounded"
          placeholder="End Date"
        />
      </div>

      <CustomDataGrid
        rows={filteredRegistrars}
        columns={columns}
        loading={isLoading}
        getRowId={(row: any) => row?.id || Math.random()}
      />

      <RegistrarForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedRegistrar}
        title={selectedRegistrar ? "Edit Registrar" : "Add Registrar"}
      />
    </div>
  );
};

export default Registrars;
