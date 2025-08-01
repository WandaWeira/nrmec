import { useState, useEffect } from "react";
import {
  useGetVillageCellsQuery,
  useGetParishWardsQuery,
  useGetSubcountyDivisionsQuery,
  useGetConstituenciesAndMunicipalitiesQuery,
} from "../store/api/baseApi";

interface RegistrarFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  title: string;
}

const RegistrarForm = ({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
}: RegistrarFormProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    ninNumber: "",
    administrativeUnitType: "",
    administrativeUnitId: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        startDate: initialData.startDate?.split("T")[0] || "",
        endDate: initialData.endDate?.split("T")[0] || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Fetch administrative units based on type
  const { data: villageCells } = useGetVillageCellsQuery(
    formData.administrativeUnitType === "village" ? {} : {},
    {
      skip: formData.administrativeUnitType !== "village",
    }
  );
  const { data: parishWards } = useGetParishWardsQuery(undefined, {
    skip: formData.administrativeUnitType !== "parish",
  });
  const { data: subcountyDivisions } = useGetSubcountyDivisionsQuery(
    undefined,
    {
      skip: formData.administrativeUnitType !== "subcounty",
    }
  );
  const { data: constituencyMunicipalities } =
    useGetConstituenciesAndMunicipalitiesQuery(undefined, {
      skip: formData.administrativeUnitType !== "constituency",
    });

  // Reset administrativeUnitId when type changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      administrativeUnitId: "",
    }));
  }, [formData.administrativeUnitType]);

  const getAdministrativeUnits = () => {
    switch (formData.administrativeUnitType) {
      case "village":
        return Array.isArray(villageCells) ? villageCells : [];
      case "parish":
        return Array.isArray(parishWards) ? parishWards : [];
      case "subcounty":
        return Array.isArray(subcountyDivisions) ? subcountyDivisions : [];
      case "constituency":
        return Array.isArray(constituencyMunicipalities)
          ? constituencyMunicipalities
          : [];
      default:
        return [];
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white rounded-lg shadow-xl">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  NIN Number
                </label>
                <input
                  type="text"
                  name="ninNumber"
                  value={formData.ninNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Administrative Unit Type
                </label>
                <select
                  name="administrativeUnitType"
                  value={formData.administrativeUnitType}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="">Select Unit Type</option>
                  <option value="village">Village/Cell</option>
                  <option value="parish">Parish/Ward</option>
                  <option value="subcounty">Subcounty/Division</option>
                  <option value="constituency">
                    Constituency/Municipality
                  </option>
                </select>
              </div>

              {formData.administrativeUnitType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.administrativeUnitType.charAt(0).toUpperCase() +
                      formData.administrativeUnitType.slice(1)}{" "}
                    Name
                  </label>
                  <select
                    name="administrativeUnitId"
                    value={formData.administrativeUnitId}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="">
                      Select {formData.administrativeUnitType}
                    </option>
                    {getAdministrativeUnits().map((unit: any) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-yellow-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrarForm;
