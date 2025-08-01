import React, { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import Loading from "../Loading";
import InternalPartyFilters from "./InternalPartyFilters";
import GenericInternalTable from "./GenericInternalTable";
import CandidateFormModal from "./CandidateFormModal";
import CandidateDetailsModal from "../CandidateDetailsModal";
import internalPartyElectionsConfig from "../../config/intenal_party_elections_config.json";
import {
  useGetInternalPartyCandidatesQuery,
  useCreateInternalPartyCandidateMutation,
  useUpdateInternalPartyCandidateMutation,
  useDeleteInternalPartyCandidateMutation,
} from "../../store/api/internal_elections_api";

interface Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  ninNumber: string;
  phoneNumber: string;
  electionType: string;
  gender?: string;
}

interface CandidateParticipation {
  id?: number;
  candidateId?: number;
  electionType: string;
  level: string;
  positionPath?: string;
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
  candidate?: Candidate;
  region?: { id: number; name: string; };
  subregion?: { id: number; name: string; };
  district?: { id: number; name: string; };
  constituencyMunicipality?: { id: number; name: string; };
  subcountyDivision?: { id: number; name: string; };
  parishWard?: { id: number; name: string; };
  villageCell?: { id: number; name: string; };
}

interface InternalElectionContainerProps {
  level: string; // e.g., "DISTRICT", "CONSTITUENCY_MUNICIPALITY", etc.
}

const InternalElectionContainer: React.FC<InternalElectionContainerProps> = ({ level }) => {
  const [adminFilters, setAdminFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<CandidateParticipation | null>(null);
  const [newCandidate, setNewCandidate] = useState<Partial<CandidateParticipation>>({});
  const [operationResult, setOperationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Get data from API
  const {
    data: candidates = [],
    isLoading,
    refetch,
  } = useGetInternalPartyCandidatesQuery({
    level,
    ...adminFilters,
  });

  // Mutations
  const [createCandidate] = useCreateInternalPartyCandidateMutation();
  const [updateCandidate] = useUpdateInternalPartyCandidateMutation();
  const [deleteCandidate] = useDeleteInternalPartyCandidateMutation();
  // Dynamic category/position/subcategory logic based on level
  const levelConfig = internalPartyElectionsConfig?.INTERNAL_PARTY?.[level] || {};
  const categories = Object.keys(levelConfig);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  // For handling deeper nested structures (like region-specific positions)
  const [selectedNestedCategory, setSelectedNestedCategory] = useState<string>("");  // Determine the structure of the configuration
  const categoryValue = levelConfig[selectedCategory];
  const isDirectPosition = categoryValue === null;
  
  // Handle subcategories (first level nesting)
  const subcategories = categoryValue && typeof categoryValue === "object"
    ? Object.keys(categoryValue)
    : [];
  const isSubcategory = subcategories.length > 0 && categoryValue && typeof categoryValue === "object";
  
  // Handle the subcategory value
  const subcategoryValue = isSubcategory ? categoryValue[selectedSubcategory] : null;
  const subcategoryIsDirectPosition = subcategoryValue === null;
  
  // Handle positions or further nesting
  const positions = [];
  let hasNestedCategories = false;
  let nestedCategories: string[] = [];
    // Dynamic analysis of the hierarchy
  if (subcategoryValue && typeof subcategoryValue === "object") {
    // Check if all values in this level are null (all are direct positions)
    const keys = Object.keys(subcategoryValue);
    const allValuesAreNull = keys.every(key => subcategoryValue[key] === null);
    
    // Check if at least one value is an object (might have nested structures)
    const hasObjectValues = keys.some(key => 
      subcategoryValue[key] !== null && typeof subcategoryValue[key] === 'object'
    );
    
    // Check if it's a mixed structure (some nulls, some objects)
    const isMixedStructure = !allValuesAreNull && !keys.every(key => 
      subcategoryValue[key] !== null && typeof subcategoryValue[key] === 'object'
    );
    
    if (allValuesAreNull) {
      // All items are positions, no further nesting needed
      keys.forEach(key => positions.push(key));
    } else if (hasObjectValues) {
      // Mixed structure or all objects - check the pattern
      hasNestedCategories = true;
      nestedCategories = keys;
      
      // If a nested category is selected, analyze its structure
      if (selectedNestedCategory) {
        const nestedValue = subcategoryValue[selectedNestedCategory];
        
        // Handle different nested value types
        if (nestedValue === null) {
          // This is a direct position at the nested level (no further selection needed)
          // e.g., INTERNAL_PARTY.NATIONAL.VICE_CHAIRPERSON_OF_REGIONS.EASTERN
        } else if (typeof nestedValue === "object") {
          // Check if all values at this nested level are null (all direct positions)
          const nestedKeys = Object.keys(nestedValue);
          const allNestedValuesAreNull = nestedKeys.every(key => nestedValue[key] === null);
          
          if (allNestedValuesAreNull) {
            // All nested values are direct positions
            nestedKeys.forEach(key => positions.push(key));
          } else {
            // Handle complex nested structures (e.g., region-specific positions)
            nestedKeys.forEach(key => {
              const finalValue = nestedValue[key];
              if (finalValue === null) {
                positions.push(key);
              }
            });
          }
        }
      }
    } else if (isMixedStructure) {
      // Mixed structure with some null values and some objects
      keys.forEach(key => {
        if (subcategoryValue[key] === null) {
          // This is a direct position
          positions.push(key);
        }
      });
      
      // Also identify nested categories
      hasNestedCategories = true;
      nestedCategories = keys.filter(key => 
        subcategoryValue[key] !== null && typeof subcategoryValue[key] === 'object'
      );
    } else {
      // Regular subcategory structure with position values
      Object.keys(subcategoryValue).forEach(key => positions.push(key));
    }
  }

  // Handlers
  const handleAdd = () => {
    setEditingCandidate(null);
    setNewCandidate({
      electionType: "INTERNAL_PARTY",
      level,
      year: new Date().getFullYear(),
      status: "pending",
      isQualified: false,
      vote: 0,
      candidate: {
        id: 0,
        firstName: "",
        lastName: "",
        ninNumber: "",
        phoneNumber: "",
        gender: "",
        electionType: "INTERNAL_PARTY"
      },
    });
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedPosition("");
    setIsModalOpen(true);
  };  const handleEdit = (candidate: CandidateParticipation) => {
    setEditingCandidate(candidate);
    setNewCandidate({
      ...candidate,
      candidate: candidate.candidate || {
        id: 0,
        firstName: "",
        lastName: "",
        ninNumber: "",
        phoneNumber: "",
        gender: "",
        electionType: "INTERNAL_PARTY"
      }
    });
    
    // Extract category, subcategory, and position from the candidate's positionPath
    if (candidate.positionPath) {
      const parts = candidate.positionPath.split('.');
      
      // Remove the prefix parts (INTERNAL_PARTY.LEVEL)
      const relevantParts = parts.slice(2); // Skip "INTERNAL_PARTY" and level
      
      // Reset all selections first
      setSelectedCategory("");
      setSelectedSubcategory("");
      setSelectedNestedCategory("");
      setSelectedPosition("");
      
      if (relevantParts.length > 0) {
        // First part is always the category
        setSelectedCategory(relevantParts[0]);
        
        // Check the config to determine the structure
        const categoryConfig = internalPartyElectionsConfig?.INTERNAL_PARTY?.[level]?.[relevantParts[0]];
        
        if (categoryConfig === null) {
          // This is a direct position (e.g., INTERNAL_PARTY.NATIONAL.NATIONAL_LEADER)
          // Nothing else to set
        } else if (relevantParts.length > 1) {
          // At least we have a subcategory
          setSelectedSubcategory(relevantParts[1]);
          
          // Check if the subcategory is a direct position or has further nesting
          const subcategoryConfig = categoryConfig?.[relevantParts[1]];
          
          if (subcategoryConfig === null) {
            // This is a category with direct position (e.g., INTERNAL_PARTY.NATIONAL.VICE_CHAIRPERSON_OF_REGIONS.EASTERN)
            // Nothing else to set - subcategory is already set
          } else if (relevantParts.length > 2) {
            // Check for nested category or position
            if (relevantParts.length === 3) {
              // Could be a regular position or a nested category
              const possibleNestedConfig = subcategoryConfig?.[relevantParts[2]];
              
              if (possibleNestedConfig === null || typeof possibleNestedConfig !== 'object') {
                // This is a regular position (e.g., INTERNAL_PARTY.DISTRICT.YOUTH.CHAIRPERSON)
                setSelectedPosition(relevantParts[2]);
              } else {
                // This is a nested category (e.g., INTERNAL_PARTY.NATIONAL.CHAIRPERSONS_OF_LEAGUES.YOUTH)
                setSelectedNestedCategory(relevantParts[2]);
              }
            } else if (relevantParts.length > 3) {
              // Complex nested structure
              setSelectedNestedCategory(relevantParts[2]);
              
              // Check if there's another level or direct position
              const nestedConfig = subcategoryConfig?.[relevantParts[2]];
              
              if (nestedConfig === null) {
                // The nested category itself is the position (rare case)
              } else if (typeof nestedConfig === 'object') {
                // Final position level
                if (relevantParts.length > 3) {
                  setSelectedPosition(relevantParts[3]);
                }
              }
            }
          }
        }
      }
    }
    
    setIsModalOpen(true);
  };

  const handleRowClick = (params: any) => {
    setSelectedCandidate(params.row);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await deleteCandidate(id).unwrap();
        setOperationResult({
          success: true,
          message: "Candidate deleted successfully",
        });
        setTimeout(() => {
          setOperationResult(null);
        }, 3000);
        refetch();
      } catch (error) {
        setOperationResult({
          success: false,
          message: "Failed to delete candidate",
        });
        setTimeout(() => {
          setOperationResult(null);
        }, 3000);
      }
    }
  };  
  
  const handleSave = async () => {
    try {
      // Build the position path based on the hierarchy
      let positionPath;
      let actualPosition;
      
      // 1. Direct position at category level (e.g., INTERNAL_PARTY.NATIONAL.NATIONAL_LEADER)
      if (isDirectPosition) {
        positionPath = `INTERNAL_PARTY.${level}.${selectedCategory}`;
        actualPosition = selectedCategory;
      } 
      // 2. Direct position at subcategory level (e.g., INTERNAL_PARTY.NATIONAL.VICE_CHAIRPERSON_OF_REGIONS.EASTERN)
      else if (isSubcategory && subcategoryIsDirectPosition) {
        positionPath = `INTERNAL_PARTY.${level}.${selectedCategory}.${selectedSubcategory}`;
        actualPosition = selectedSubcategory;
      } 
      // 3. Nested category structure
      else if (isSubcategory && hasNestedCategories && selectedNestedCategory) {
        // Check the value at this nesting level
        const nestedValue = subcategoryValue[selectedNestedCategory];
        
        if (nestedValue === null) {
          // The nested category itself is the final position (e.g., a region name)
          positionPath = `INTERNAL_PARTY.${level}.${selectedCategory}.${selectedSubcategory}.${selectedNestedCategory}`;
          actualPosition = selectedNestedCategory;
        } else if (selectedPosition) {
          // We have a deeper structure with a position selected
          positionPath = `INTERNAL_PARTY.${level}.${selectedCategory}.${selectedSubcategory}.${selectedNestedCategory}.${selectedPosition}`;
          actualPosition = selectedPosition;
        } else {
          // Missing position in a complex structure
          throw new Error("Position selection is required for this structure");
        }
      }
      // 4. Regular subcategory with position (standard case)
      else if (isSubcategory && selectedSubcategory && selectedPosition) {
        positionPath = `INTERNAL_PARTY.${level}.${selectedCategory}.${selectedSubcategory}.${selectedPosition}`;
        actualPosition = selectedPosition;
      }
      // 5. Error case - incomplete selection
      else {
        throw new Error("Incomplete election position selection");
      }
      
      console.log("Built position path:", positionPath);
      
      if (!positionPath) {
        throw new Error("Failed to construct a valid position path");
      }
      
      const candidateData = {
        ...newCandidate,
        category: selectedCategory,
        subcategory: selectedSubcategory || undefined,
        nestedCategory: selectedNestedCategory || undefined,
        position: actualPosition,
        positionPath,
      };


      console.log("-------Candidate Data:", candidateData);

      if (editingCandidate) {
        // Update existing candidate
        await updateCandidate({ 
          id: editingCandidate.id!, 
          updates: candidateData 
        }).unwrap();
        setOperationResult({
          success: true,
          message: "Candidate updated successfully",
        });
      } else {
        // Create new candidate
        await createCandidate(candidateData).unwrap();
        setOperationResult({
          success: true,
          message: "Candidate added successfully",
        });
      }

      setIsModalOpen(false);
      refetch();      setTimeout(() => {
        setOperationResult(null);
      }, 3000);
    } catch (error) {
      console.error("Error saving candidate:", error);
      setOperationResult({
        success: false,
        message: error instanceof Error ? error.message : "Operation failed",
      });
      setTimeout(() => {
        setOperationResult(null);
      }, 3000);
    }
  };

  const handleFilterChange = (filters: any) => {
    setAdminFilters(filters);
  };

  // Process candidates for table display
  const processedCandidates = candidates?.map((candidate) => {
    return {
      ...candidate,
      id: candidate.id,
      firstName: candidate.candidate?.firstName || "",
      lastName: candidate.candidate?.lastName || "",
      ninNumber: candidate.candidate?.ninNumber || "",
      phoneNumber: candidate.candidate?.phoneNumber || "",
      gender: candidate.candidate?.gender || "",
      regionName: candidate.region?.name || "",
      subregionName: candidate.subregion?.name || "",
      districtName: candidate.district?.name || "",
      constituencyName: candidate.constituencyMunicipality?.name || "",
      subcountyName: candidate.subcountyDivision?.name || "",
      parishName: candidate.parishWard?.name || "",
      villageName: candidate.villageCell?.name || "",
    };
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      {operationResult && (
        <div
          className={`${
            operationResult.success ? "bg-green-100" : "bg-red-100"
          } border ${
            operationResult.success ? "border-green-400" : "border-red-400"
          } text-${
            operationResult.success ? "green" : "red"
          }-700 px-4 py-3 rounded relative mb-4`}
        >
          <div className="flex items-center">
            {operationResult.success ? (
              <CheckCircle className="mr-2" size={20} />
            ) : (
              <AlertCircle className="mr-2" size={20} />
            )}
            <span>{operationResult.message}</span>
          </div>
        </div>      )}

      <div className="mb-4">
        <InternalPartyFilters
          level={level}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {level.replace(/_/g, "/")} Internal Party Candidates
        </h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Candidate
        </button>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <GenericInternalTable
          candidates={processedCandidates}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}      {isModalOpen && (
        <CandidateFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          candidate={newCandidate}
          setCandidate={setNewCandidate}
          onSave={handleSave}
          isEditing={!!editingCandidate}
          title={editingCandidate ? "Edit Candidate" : "Add New Candidate"}
          level={level}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          subcategories={subcategories}
          selectedSubcategory={selectedSubcategory}
          setSelectedSubcategory={setSelectedSubcategory}
          positions={positions}
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
          isDirectPosition={isDirectPosition}
          isSubcategory={isSubcategory}
          subcategoryIsDirectPosition={subcategoryIsDirectPosition}
          hasNestedCategories={hasNestedCategories}
          nestedCategories={nestedCategories}
          selectedNestedCategory={selectedNestedCategory}
          setSelectedNestedCategory={setSelectedNestedCategory}          positionFieldName="Position"
          categoryFieldName="League/Committee"
        />
      )}

      {isDetailsModalOpen && selectedCandidate && (
        <CandidateDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          candidate={selectedCandidate}
        />
      )}
    </div>
  );
};

export default InternalElectionContainer;