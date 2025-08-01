import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
  state?: any; // Add state to carry hierarchy information
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  currentEntityHierarchy?: any; // Add current entity's full hierarchy data
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ 
  items, 
  currentEntityHierarchy 
}) => {
  const navigate = useNavigate();

  // Function to handle breadcrumb click with hierarchy preservation
  const handleBreadcrumbClick = (e: React.MouseEvent, item: BreadcrumbItem, index: number) => {
    e.preventDefault();
    
    // If we already have state defined for this breadcrumb, use it
    if (item.state) {
      navigate(item.path, { state: item.state });
      return;
    }
    
    // If we have hierarchy data and this is a parent item, construct the state
    if (currentEntityHierarchy && index < items.length - 1) {
      // Determine what level in the hierarchy this breadcrumb represents
      const levelMap: {[key: string]: string} = {
        'regions': 'region',
        'subregions': 'subregion',
        'districts': 'district',
        'constituencies-municipalities': 'constituency',
        'subcounties-divisions': 'subcounty',
        'parishes-wards': 'parish',
        'villages-cells': 'village'
      };
      
      // Extract the entity type from the path
      const pathParts = item.path.split('/');
      const entityType = pathParts[1]; // e.g., 'regions', 'districts', etc.
      
      // Build the state object with the right parent entities
      const state: any = {};
      
      if (entityType === 'regions') {
        // No parent state needed for regions
        navigate(item.path);
        return;
      }
      
      // For other levels, add appropriate parent data
      // The hierarchy is: region > subregion > district > constituency > subcounty > parish > village
      if (entityType === 'subregions' && currentEntityHierarchy.region) {
        state.parentRegion = currentEntityHierarchy.region;
      }
      
      if (entityType === 'districts' && currentEntityHierarchy.subregion) {
        state.parentSubregion = currentEntityHierarchy.subregion;
        state.parentRegion = currentEntityHierarchy.region;
      }
      
      if (entityType === 'constituencies-municipalities' && currentEntityHierarchy.district) {
        state.parentDistrict = currentEntityHierarchy.district;
        state.parentSubregion = currentEntityHierarchy.subregion;
        state.parentRegion = currentEntityHierarchy.region;
      }
      
      if (entityType === 'subcounties-divisions' && currentEntityHierarchy.constituency) {
        state.parentConstituency = currentEntityHierarchy.constituency;
        state.parentDistrict = currentEntityHierarchy.district;
        state.parentSubregion = currentEntityHierarchy.subregion;
        state.parentRegion = currentEntityHierarchy.region;
      }
      
      if (entityType === 'parishes-wards' && currentEntityHierarchy.subcounty) {
        state.parentSubcounty = currentEntityHierarchy.subcounty;
        state.parentConstituency = currentEntityHierarchy.constituency;
        state.parentDistrict = currentEntityHierarchy.district;
        state.parentSubregion = currentEntityHierarchy.subregion;
        state.parentRegion = currentEntityHierarchy.region;
      }
      
      navigate(item.path, { state });
    } else {
      // Fallback to simple navigation without state
      navigate(item.path);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <span className="text-gray-500">›</span>}
          <a 
            href={item.path} 
            className={`${index === items.length - 1 ? 'text-gray-800 font-medium' : 'text-blue-600 hover:underline'}`}
            onClick={(e) => handleBreadcrumbClick(e, item, index)}
          >
            {item.name}
          </a>
        </React.Fragment>
      ))}
    </div>
  );
};

export default BreadcrumbNavigation;