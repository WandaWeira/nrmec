import { useParams, useLocation } from "react-router-dom";
import { useGetVillageCellDetailsQuery } from "../../store/api/baseApi";
import Loading from "../../components/Loading";
import BreadcrumbNavigation from "../../components/BreadcrumbNavigation";
import { Card, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HierarchyInfo from "../../components/HierarchyInfo";

interface LocationState {
  parentParish?: {
    id: string;
    name: string;
    type?: string;
  };
  parentSubcounty?: {
    id: string;
    name: string;
    type?: string;
  };
  parentConstituency?: {
    id: string;
    name: string;
    type?: string;
  };
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

const VillageCellDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    parentParish, 
    parentSubcounty, 
    parentConstituency, 
    parentDistrict, 
    parentSubregion, 
    parentRegion 
  } = (location.state as LocationState) || {};
  
  const { data: details, isLoading } = useGetVillageCellDetailsQuery(id ?? "");

  // Create a hierarchyData object from either the API response or location state
  const hierarchyData = details?.hierarchy || {
    region: parentRegion,
    subregion: parentSubregion,
    district: parentDistrict,
    constituency: parentConstituency,
    subcounty: parentSubcounty,
    parish: parentParish,
    village: {
      id,
      name: details?.name,
      type: details?.type
    }
  };

  // Breadcrumb configuration
  const breadcrumbItems = [
    { id: 'regions', name: 'Regions', path: '/administrative-units/regions' },
    ...(hierarchyData.region ? [{ id: hierarchyData.region.id, name: hierarchyData.region.name, path: `/regions/${hierarchyData.region.id}` }] : []),
    ...(hierarchyData.subregion ? [{ id: hierarchyData.subregion.id, name: hierarchyData.subregion.name, path: `/subregions/${hierarchyData.subregion.id}` }] : []),
    ...(hierarchyData.district ? [{ id: hierarchyData.district.id, name: hierarchyData.district.name, path: `/districts/${hierarchyData.district.id}` }] : []),
    ...(hierarchyData.constituency ? [{ 
      id: hierarchyData.constituency.id, 
      name: hierarchyData.constituency.name, 
      path: `/constituencies-municipalities/${hierarchyData.constituency.id}` 
    }] : []),
    ...(hierarchyData.subcounty ? [{ 
      id: hierarchyData.subcounty.id, 
      name: hierarchyData.subcounty.name, 
      path: `/subcounties-divisions/${hierarchyData.subcounty.id}` 
    }] : []),
    ...(hierarchyData.parish ? [{ 
      id: hierarchyData.parish.id, 
      name: hierarchyData.parish.name, 
      path: `/parishes-wards/${hierarchyData.parish.id}` 
    }] : []),
    { id: id || '', name: details?.name || 'Village/Cell Details', path: `/villages-cells/${id}` }
  ];

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
        {details?.name} {details?.type === 'village' ? 'Village' : 'Cell'} Details
      </h1>

      {/* Hierarchy Information */}
      {(hierarchyData.region || hierarchyData.subregion || hierarchyData.district || 
  hierarchyData.constituency || hierarchyData.subcounty || hierarchyData.parish) && (
  <HierarchyInfo 
    items={[
      ...(hierarchyData.region ? [{ 
        label: "Region", 
        value: hierarchyData.region.name, 
        id: `region-${hierarchyData.region.id || '1'}` 
      }] : []),
      
      ...(hierarchyData.subregion ? [{ 
        label: "Subregion", 
        value: hierarchyData.subregion.name, 
        id: `subregion-${hierarchyData.subregion.id || '1'}` 
      }] : []),
      
      ...(hierarchyData.district ? [{ 
        label: "District", 
        value: hierarchyData.district.name, 
        id: `district-${hierarchyData.district.id || '1'}` 
      }] : []),
      
      ...(hierarchyData.constituency ? [{ 
        label: hierarchyData.constituency.type === 'constituency' ? 'Constituency' : 'Municipality', 
        value: hierarchyData.constituency.name, 
        id: `constituency-${hierarchyData.constituency.id || '1'}` 
      }] : []),
      
      ...(hierarchyData.subcounty ? [{ 
        label: hierarchyData.subcounty.type === 'subcounty' ? 'Subcounty' : 'Division', 
        value: hierarchyData.subcounty.name, 
        id: `subcounty-${hierarchyData.subcounty.id || '1'}` 
      }] : []),
      
      ...(hierarchyData.parish ? [{ 
        label: hierarchyData.parish.type === 'parish' ? 'Parish' : 'Ward', 
        value: hierarchyData.parish.name, 
        id: `parish-${hierarchyData.parish.id || '1'}` 
      }] : [])
    ]}
  />
)}

      {/* Village/Cell Information */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {details?.population && (
            <div>
              <span className="font-medium text-gray-700">Population:</span>
              <div className="text-2xl font-bold">{details.population}</div>
            </div>
          )}
          
          {details?.area && (
            <div>
              <span className="font-medium text-gray-700">Area:</span>
              <div className="text-2xl font-bold">{details.area} km²</div>
            </div>
          )}
          
          {details?.leader && (
            <div>
              <span className="font-medium text-gray-700">Village Leader:</span>
              <div className="text-gray-900">{details.leader}</div>
            </div>
          )}
          
          {details?.establishment && (
            <div>
              <span className="font-medium text-gray-700">Established:</span>
              <div className="text-gray-900">{details.establishment}</div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information (if available) */}
      {details?.description && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <div className="text-gray-700 whitespace-pre-line">
            {details.description}
          </div>
        </div>
      )}
      
      {/* Infrastructure Information (if available) */}
      {details?.infrastructure && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {details.infrastructure.schools && (
              <div>
                <span className="font-medium text-gray-700">Schools:</span>
                <div className="text-gray-900">{details.infrastructure.schools}</div>
              </div>
            )}
            
            {details.infrastructure.healthCenters && (
              <div>
                <span className="font-medium text-gray-700">Health Centers:</span>
                <div className="text-gray-900">{details.infrastructure.healthCenters}</div>
              </div>
            )}
            
            {details.infrastructure.waterSources && (
              <div>
                <span className="font-medium text-gray-700">Water Sources:</span>
                <div className="text-gray-900">{details.infrastructure.waterSources}</div>
              </div>
            )}
            
            {details.infrastructure.roads && (
              <div>
                <span className="font-medium text-gray-700">Roads (km):</span>
                <div className="text-gray-900">{details.infrastructure.roads}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VillageCellDetails;