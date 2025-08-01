import { useParams, useLocation } from "react-router-dom";
import { useGetDistrictDetailsQuery } from "../../store/api/baseApi";
import Loading from "../../components/Loading";
import CustomDataGrid from "../../components/CustomDataGrid";
import BreadcrumbNavigation from "../../components/BreadcrumbNavigation";
import { GridColDef } from "@mui/x-data-grid";
import { Card, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HierarchyInfo from "../../components/HierarchyInfo";

interface LocationState {
  parentSubregion?: {
    id: string;
    name: string;
  };
  parentRegion?: {
    id: string;
    name: string;
  };
}

const DistrictDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { parentSubregion, parentRegion } =
    (location.state as LocationState) || {};

  const { data: districtDetails, isLoading } = useGetDistrictDetailsQuery(
    id ?? ""
  );

  console.log(districtDetails);

  // Create a hierarchyData object from either the API response or location state
  const hierarchyData = districtDetails?.hierarchy || {
    region: parentRegion,
    subregion: parentSubregion,
    district: {
      id,
      name: districtDetails?.name,
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
    {
      id: id || "",
      name: districtDetails?.name || "District Details",
      path: `/districts/${id}`,
    },
  ];

  // Detailed breakdown columns - showing counts per constituency
  const detailedColumns: GridColDef[] = [
    {
      field: "name",
      headerName: "Constituency/Municipality",
      flex: 1,
      renderCell: (params) => (
        <div
          className="cursor-pointer hover:text-gray-700"
          onClick={() =>
            navigate(`/constituencies-municipalities/${params.row.id}`, {
              state: {
                parentDistrict: {
                  id: id,
                  name: districtDetails?.name,
                },
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
    { field: "subcountiesCount", headerName: "Subcounties/Divisions", flex: 1 },
    { field: "parishesCount", headerName: "Parishes/Wards", flex: 1 },
    { field: "villagesCount", headerName: "Villages/Cells", flex: 1 },
  ];

  const detailedRows =
    districtDetails?.constituencyBreakdown?.map((constituency: any) => ({
      id: constituency.id,
      name: constituency.name,
      subcountiesCount: constituency.subcountiesCount,
      parishesCount: constituency.parishesCount,
      villagesCount: constituency.villagesCount,
    })) || [];

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation
        items={breadcrumbItems}
        currentEntityHierarchy={hierarchyData}
      />

<br></br>


      <h1 className="text-2xl font-bold mb-6">
        {districtDetails?.name} District Details
      </h1>

      {/* Hierarchy Information */}
      {/* Hierarchy Information */}
      {(hierarchyData.region || hierarchyData.subregion) && (
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
          ]}
        />
      )}
 <br></br>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-600">Constituencies/Municipalities</div>
          <div className="text-3xl font-bold">
            {districtDetails?.constituenciesCount || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-600">Subcounties/Divisions</div>
          <div className="text-3xl font-bold">
            {districtDetails?.subcountiesCount || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-600">Parishes/Wards</div>
          <div className="text-3xl font-bold">
            {districtDetails?.parishesCount || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-600">Villages/Cells</div>
          <div className="text-3xl font-bold">
            {districtDetails?.villagesCount || 0}
          </div>
        </div>
      </div>

      {/* Constituency-wise Breakdown Table */}
      <div className="bg-white rounded shadow">
        <div className="grid grid-cols-4 p-4 border-b font-medium">
          <div className="col-span-1">Constituency/Municipality</div>
          <div className="col-span-1">Subcounties/Divisions</div>
          <div className="col-span-1">Parishes/Wards</div>
          <div className="col-span-1">Villages/Cells</div>
        </div>

        {detailedRows.map((constituency) => (
          <div
            key={constituency.id}
            className="grid grid-cols-4 p-4 border-b bg-yellow-50 hover:bg-yellow-100 cursor-pointer"
            onClick={() =>
              navigate(`/constituencies-municipalities/${constituency.id}`, {
                state: {
                  parentDistrict: {
                    id,
                    name: districtDetails?.name,
                  },
                  parentSubregion: hierarchyData.subregion,
                  parentRegion: hierarchyData.region,
                },
              })
            }
          >
            <div className="col-span-1">{constituency.name}</div>
            <div className="col-span-1">{constituency.subcountiesCount}</div>
            <div className="col-span-1">{constituency.parishesCount}</div>
            <div className="col-span-1">{constituency.villagesCount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistrictDetails;
