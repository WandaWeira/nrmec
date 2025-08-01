import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Map, LandPlot, Home, Trees, ChevronDown, ChevronUp } from 'lucide-react';

interface HierarchyItem {
  label: string;
  value: string;
  id: string;
}

interface HierarchyInfoProps {
  items: HierarchyItem[];
  title?: string;
}

const getIconAndColor = (label: string): { Icon: any; bgColor: string; iconColor: string } => {
  const normalizedLabel = label.toLowerCase();
  
  if (normalizedLabel.includes('region')) {
    return { Icon: Building2, bgColor: 'bg-blue-100', iconColor: 'text-blue-500' };
  }
  if (normalizedLabel.includes('subregion')) {
    return { Icon: Map, bgColor: 'bg-green-100', iconColor: 'text-green-500' };
  }
  if (normalizedLabel.includes('district')) {
    return { Icon: MapPin, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-500' };
  }
  if (normalizedLabel.includes('constituency') || normalizedLabel.includes('municipalit')) {
    return { Icon: Map, bgColor: 'bg-purple-100', iconColor: 'text-purple-500' };
  }
  if (normalizedLabel.includes('subcounty') || normalizedLabel.includes('division')) {
    return { Icon: LandPlot, bgColor: 'bg-orange-100', iconColor: 'text-orange-500' };
  }
  if (normalizedLabel.includes('parish') || normalizedLabel.includes('ward')) {
    return { Icon: Home, bgColor: 'bg-pink-100', iconColor: 'text-pink-500' };
  }
  if (normalizedLabel.includes('village') || normalizedLabel.includes('cell')) {
    return { Icon: Trees, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-500' };
  }
  
  return { Icon: MapPin, bgColor: 'bg-gray-100', iconColor: 'text-gray-500' };
};

const HierarchyInfo: React.FC<HierarchyInfoProps> = ({ 
  items, 
  title = "Location Hierarchy" 
}) => {
  // Check if the last item is a village or cell to set initial state
  const hasVillageAsLastItem = () => {
    if (items.length === 0) return false;
    const lastItem = items[items.length - 1];
    console.log("vill-->",lastItem)
    const normalizedLabel = lastItem.label.toLowerCase();
    return normalizedLabel.includes('parish')   //|| normalizedLabel.includes('cell');
  };

  const [isExpanded, setIsExpanded] = useState(hasVillageAsLastItem());

  // Use effect to update expansion state when items change
  useEffect(() => {
    setIsExpanded(hasVillageAsLastItem());
  }, [items]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header - Now clickable */}
      <div 
        className="bg-gray-800 px-6 py-4 flex justify-between items-center cursor-pointer"
        onClick={toggleExpand}
      >
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <button 
          className="text-white focus:outline-none transition-transform duration-200"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <div className="flex items-center">
              <span className="text-sm mr-2">Close to hide details</span>
              <ChevronUp className="w-6 h-6" />
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-sm mr-2">Click to view details</span>
              <ChevronDown className="w-6 h-6" />
            </div>
          )}
        </button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <>
          {/* Hierarchy Items */}
          <div className="divide-y divide-gray-100">
            {items.map((item, index) => {
              const { Icon, bgColor, iconColor } = getIconAndColor(item.label);
              
              return (
                <div 
                  key={item.id || index}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center flex-1">
                    <div className={`${bgColor} p-2 rounded-lg`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{item.label}</p>
                      <p className="text-base font-semibold text-gray-900">{item.value}</p>
                    </div>
                  </div>
                  
                  {/* {index < items.length - 1 && (
                    <MapPin className="w-5 h-5 text-gray-400" />
                  )} */}
                </div>
              );
            })}
          </div>

          {/* Stats Footer */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Levels: {items.length}</span>
              <span>Last Updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HierarchyInfo;