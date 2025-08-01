import { useParams, useLocation } from "react-router-dom";
import { useGetConstituencyMunicipalityDetailsQuery } from "../../store/api/baseApi";
import Loading from "../../components/Loading";
import CustomDataGrid from "../../components/CustomDataGrid";
import BreadcrumbNavigation from "../../components/BreadcrumbNavigation";
import { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import HierarchyInfo from "../../components/HierarchyInfo";

interface LocationState {
  parentDistrict?: {
    id: string;
    name: string;
  };
  parentSubregion?: {
    id: string;
    name: string;
  };
  parentRegion?: {
    id: string;
    name: string;
  };
}

const ConstituencyMunicipalityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { parentDistrict, parentSubregion, parentRegion } =
    (location.state as LocationState) || {};

  const { data: details, isLoading } =
    useGetConstituencyMunicipalityDetailsQuery(id ?? "");
  console.log("muni", details);
  // Create a hierarchyData object from either the API response or location state
  const hierarchyData = details?.hierarchy || {
    region: parentRegion,
    subregion: parentSubregion,
    district: parentDistrict,
    constituency: {
      id,
      name: details?.name,
      type: details?.type,
    },
  };

  // Breadcrumb configuration
  const breadcrumbItems = [
    { id: "regions", name: "Regions", path: "/administrative-units/regions" },
    ...(hierarchyData.region
      ? [
          {
            id: hierarchyData.region.id,
            name: hierarchyData.region.name,
            path: `/regions/${hierarchyData.region.id}`,
          },
        ]
      : []),
    ...(hierarchyData.subregion
      ? [
          {
            id: hierarchyData.subregion.id,
            name: hierarchyData.subregion.name,
            path: `/subregions/${hierarchyData.subregion.id}`,
          },
        ]
      : []),
    ...(hierarchyData.district
      ? [
          {
            id: hierarchyData.district.id,
            name: hierarchyData.district.name,
            path: `/districts/${hierarchyData.district.id}`,
          },
        ]
      : []),
    {
      id: id || "",
      name: details?.name || "Constituency/Municipality Details",
      path: `/constituencies-municipalities/${id}`,
    },
  ];

  // Detailed breakdown columns - showing counts per subcounty/division
  const detailedColumns: GridColDef[] = [
    {
      field: "name",
      headerName: "Subcounty/Division",
      flex: 1,
      renderCell: (params) => (
        <div
          className="cursor-pointer hover:text-gray-700"
          onClick={() =>
            navigate(`/subcounties-divisions/${params.row.id}`, {
              state: {
                parentConstituency: {
                  id,
                  name: details?.name,
                  type: details?.type,
                },
                parentDistrict: hierarchyData.district,
                parentSubregion: hierarchyData.subregion,
                parentRegion: hierarchyData.region,
              },
            })
          }
        >
          {params.value}
        </div>
      ),
    },
    { field: "parishesCount", headerName: "Parishes/Wards", flex: 1 },
    { field: "villagesCount", headerName: "Villages/Cells", flex: 1 },
  ];

  const detailedRows =
    details?.subcountyBreakdown?.map((subcounty: any) => ({
      id: subcounty.id,
      name: subcounty.name,
      parishesCount: subcounty.parishesCount,
      villagesCount: subcounty.villagesCount,
    })) || [];

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation
        items={breadcrumbItems}
        currentEntityHierarchy={hierarchyData}
      />

      <h1 className="text-2xl font-bold mb-6">
        {details?.name}{" "}
        {details?.type === "constituency" ? "Constituency" : "Municipality"}{" "}
        Details
      </h1>

      {/* Hierarchy Information */}
      {(hierarchyData.region ||
        hierarchyData.subregion ||
        hierarchyData.district) && (
        <HierarchyInfo
          items={[
            ...(hierarchyData.region
              ? [
                  {
                    label: "Region",
                    value: hierarchyData.region.name,
                    id: `region-${hierarchyData.region.id || "1"}`,
                  },
                ]
              : []),

            ...(hierarchyData.subregion
              ? [
                  {
                    label: "Subregion",
                    value: hierarchyData.subregion.name,
                    id: `subregion-${hierarchyData.subregion.id || "1"}`,
                  },
                ]
              : []),

            ...(hierarchyData.district
              ? [
                  {
                    label: "District",
                    value: hierarchyData.district.name,
                    id: `district-${hierarchyData.district.id || "1"}`,
                  },
                ]
              : []),
          ]}
        />
      )}
 <br></br>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-600">Subcounties/Divisions</div>
          <div className="text-3xl font-bold">
            {details?.subcountiesCount || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-600">Parishes/Wards</div>
          <div className="text-3xl font-bold">
            {details?.parishesCount || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-600">Villages/Cells</div>
          <div className="text-3xl font-bold">
            {details?.villagesCount || 0}
          </div>
        </div>
      </div>

      {/* Subcounty-wise Breakdown Table */}
      <div className="bg-white rounded shadow">
        <div className="grid grid-cols-3 p-4 border-b font-medium">
          <div className="col-span-1">Subcounty/Division</div>
          <div className="col-span-1">Parishes/Wards</div>
          <div className="col-span-1">Villages/Cells</div>
        </div>

        {detailedRows.map((subcounty) => (
          <div
            key={subcounty.id}
            className="grid grid-cols-3 p-4 border-b bg-yellow-50 hover:bg-yellow-100 cursor-pointer"
            onClick={() =>
              navigate(`/subcounties-divisions/${subcounty.id}`, {
                state: {
                  parentConstituency: {
                    id,
                    name: details?.name,
                    type: details?.type,
                  },
                  parentDistrict: hierarchyData.district,
                  parentSubregion: hierarchyData.subregion,
                  parentRegion: hierarchyData.region,
                },
              })
            }
          >
            <div className="col-span-1">{subcounty.name}</div>
            <div className="col-span-1">{subcounty.parishesCount}</div>
            <div className="col-span-1">{subcounty.villagesCount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConstituencyMunicipalityDetails;
