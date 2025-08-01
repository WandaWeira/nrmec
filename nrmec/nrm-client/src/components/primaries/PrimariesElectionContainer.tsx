import React, { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import Loading from "../Loading";
import AdminUnitFilters from "../AdminUnitFilters";
import GenericPrimariesTable from "./GenericPrimariesTable";
import CandidateFormModal from "./CandidateFormModal";
import CandidateDetailsModal from "../CandidateDetailsModal";
import primariesElectionsConfig from "../../config/primaries_elections_config.json";
import {
  useGetPrimariesCandidatesQuery,
  useCreatePrimariesCandidateMutation,
  useUpdatePrimariesCandidateMutation,
  useDeletePrimariesCandidateMutation,
} from "../../store/api/primaries_elections_api";

interface CandidateParticipation {
  id: number;
  candidateId: number;
  electionType: string;
  level: string;
  positionPath: string;
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
  candidate?: {
    id: number;
    firstName: string;
    lastName: string;
    ninNumber: string;
    phoneNumber: string;
    gender?: string;
  };
  region?: { id: number; name: string; };
  subregion?: { id: number; name: string; };
  district?: { id: number; name: string; };
  constituencyMunicipality?: { id: number; name: string; };
  subcountyDivision?: { id: number; name: string; };
  parishWard?: { id: number; name: string; };
  villageCell?: { id: number; name: string; };
}

interface PrimariesElectionContainerProps {
  level: string; // e.g., "DISTRICT", "CONSTITUENCY_MUNICIPALITY", etc.
}

const PrimariesElectionContainer: React.FC<PrimariesElectionContainerProps> = ({ level }) => {
  const [adminFilters, setAdminFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<CandidateParticipation | null>(null);
  const [newCandidate, setNewCandidate] = useState<Partial<CandidateParticipation>>({});
  const [operationResult, setOperationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Get data from API
  const {
    data: candidates,
    isLoading,
    refetch,
  } = useGetPrimariesCandidatesQuery({
    level,
    ...adminFilters,
  });

   console.log("----->",candidates)
  // Mutations
  const [createCandidate] = useCreatePrimariesCandidateMutation();
  const [updateCandidate] = useUpdatePrimariesCandidateMutation();
  const [deleteCandidate] = useDeletePrimariesCandidateMutation();

  // Dynamic category/position/subcategory logic based on level
  const levelConfig = primariesElectionsConfig?.PRIMARIES?.[level] || {};
  const categories = Object.keys(levelConfig);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");

  const categoryValue = levelConfig[selectedCategory];
  const isDirectPosition = categoryValue === null;
  const subcategories = categoryValue && typeof categoryValue === "object"
    ? Object.keys(categoryValue)
    : [];
  const isSubcategory = subcategories.length > 0 && categoryValue && typeof categoryValue === "object";
  const subcategoryValue = isSubcategory ? categoryValue[selectedSubcategory] : null;
  const subcategoryIsDirectPosition = subcategoryValue === null;
  const positions = subcategoryValue && typeof subcategoryValue === "object"
    ? Object.keys(subcategoryValue)
    : [];

  // Handlers
  const handleAdd = async () => {
    try {
      const phoneRegex = /^(\+256|0)[1-9][0-9]{8}$/;
      if (!phoneRegex.test(newCandidate.candidate?.phoneNumber || "")) {
        throw new Error(
          "Please enter a valid Ugandan phone number (e.g., +256712345678 or 0712345678)"
        );
      }
      
      if (
        !newCandidate.candidate?.ninNumber ||
        !newCandidate.candidate?.firstName ||
        !newCandidate.candidate?.lastName ||
        !newCandidate.candidate?.phoneNumber ||
        !newCandidate.category ||
        !newCandidate.position ||
        !newCandidate.regionId ||
        !newCandidate.subregionId ||
        !newCandidate.districtId
      ) {
        throw new Error("Please fill in all required fields");
      }
      
      const candidatePayload = {
        firstName: newCandidate.candidate.firstName,
        lastName: newCandidate.candidate.lastName,
        ninNumber: newCandidate.candidate.ninNumber,
        phoneNumber: newCandidate.candidate.phoneNumber,
        electionType: 'PRIMARIES',
        gender: newCandidate.candidate.gender || '',
      };
      
      // Prepare the participation payload based on the level
      const participationPayload: any = {
        candidate: candidatePayload,
        level,
        electionType: 'PRIMARIES',
        category: newCandidate.category,
        position: newCandidate.position,
        regionId: newCandidate.regionId,
        subregionId: newCandidate.subregionId,
        districtId: newCandidate.districtId,
        year: new Date().getFullYear()
      };
      
      // Add admin unit IDs only if they exist
      if (newCandidate.constituencyMunicipalityId) {
        participationPayload.constituencyMunicipalityId = newCandidate.constituencyMunicipalityId;
      }
      
      if (newCandidate.subcountyDivisionId) {
        participationPayload.subcountyDivisionId = newCandidate.subcountyDivisionId;
      }
      
      if (newCandidate.parishWardId) {
        participationPayload.parishWardId = newCandidate.parishWardId;
      }
      
      if (newCandidate.villageCellId) {
        participationPayload.villageCellId = newCandidate.villageCellId;
      }
      
      await createCandidate(participationPayload).unwrap();
      
      setIsModalOpen(false);
      setNewCandidate({});
      setSelectedCategory("");
      setSelectedSubcategory("");
      setSelectedPosition("");
      refetch();
      setOperationResult({
        success: true,
        message: "Candidate added successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message:
          error.message || error.data?.message || "Failed to add candidate",
      });
    }
  };
  const handleUpdate = async () => {
    if (editingCandidate) {
      try {
        // First verify required fields
        if (
          !newCandidate.category ||
          !newCandidate.position ||
          !newCandidate.regionId ||
          !newCandidate.subregionId ||
          !newCandidate.districtId
        ) {
          throw new Error("Please fill in all required fields");
        }
        
        // Prepare the updates object with admin unit hierarchical fields
        const updates: any = {
          category: newCandidate.category,
          position: newCandidate.position,
          regionId: newCandidate.regionId,
          subregionId: newCandidate.subregionId,
          districtId: newCandidate.districtId,
        };
        
        // Include optional hierarchical fields only if they exist
        if (newCandidate.constituencyMunicipalityId) {
          updates.constituencyMunicipalityId = newCandidate.constituencyMunicipalityId;
        }
        
        if (newCandidate.subcountyDivisionId) {
          updates.subcountyDivisionId = newCandidate.subcountyDivisionId;
        }
        
        if (newCandidate.parishWardId) {
          updates.parishWardId = newCandidate.parishWardId;
        }
        
        if (newCandidate.villageCellId) {
          updates.villageCellId = newCandidate.villageCellId;
        }
        
        // Also update candidate details if they exist
        if (newCandidate.candidate) {
          updates.candidateDetails = {
            firstName: newCandidate.candidate.firstName,
            lastName: newCandidate.candidate.lastName,
            ninNumber: newCandidate.candidate.ninNumber,
            phoneNumber: newCandidate.candidate.phoneNumber,
            gender: newCandidate.candidate.gender || '',
          };
        }
        
        await updateCandidate({
          id: editingCandidate.id,
          updates
        }).unwrap();
        
        setIsModalOpen(false);
        setEditingCandidate(null);
        setNewCandidate({});
        setSelectedCategory("");
        setSelectedSubcategory("");
        setSelectedPosition("");
        refetch();
        setOperationResult({
          success: true,
          message: "Candidate updated successfully",
        });
      } catch (error: any) {
        setOperationResult({
          success: false,
          message: error.data?.message || error.message || "Failed to update candidate",
        });
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCandidate(id).unwrap();
      refetch();
      setOperationResult({
        success: true,
        message: "Candidate deleted successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to delete candidate",
      });
    }
  };
  const handleEdit = (candidate: CandidateParticipation) => {
    setEditingCandidate(candidate);
    setNewCandidate({
      ...candidate,
      candidate: {
        id: candidate.candidate?.id ?? candidate.candidateId,
        firstName: candidate.candidate?.firstName || '',
        lastName: candidate.candidate?.lastName || '',
        ninNumber: candidate.candidate?.ninNumber || '',
        phoneNumber: candidate.candidate?.phoneNumber || '',
        gender: candidate.candidate?.gender || '',
      }
    });
    
    // Update category and position state
    setSelectedCategory(candidate.category);
    
    // If we have subcategories, we need to detect which one is relevant
    if (isSubcategory) {
      const categoryObj = levelConfig[candidate.category];
      if (categoryObj && typeof categoryObj === 'object') {
        // Find which subcategory contains this position
        for (const subcategory of Object.keys(categoryObj)) {
          const subCatObj = categoryObj[subcategory];
          
          // Direct position subcategory
          if (subCatObj === null && subcategory === candidate.position) {
            setSelectedSubcategory(subcategory);
            break;
          }
          
          // Nested positions
          if (subCatObj && typeof subCatObj === 'object' && 
              Object.keys(subCatObj).includes(candidate.position)) {
            setSelectedSubcategory(subcategory);
            setSelectedPosition(candidate.position);
            break;
          }
        }
      }
    }
    
    setIsModalOpen(true);
  };

  const handleRowClick = (params: any) => {
    if (!params.event.target.closest('.MuiDataGrid-cell--actions')) {
      setSelectedCandidate(params.row);
    }
  };

  const handleFilterChange = (filters: any) => {
    setAdminFilters(filters);
  };
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Notification */}
      {operationResult && (
        <div
          className={`flex items-center p-4 rounded-md ${
            operationResult.success ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {operationResult.success ? (
            <CheckCircle className="mr-2 text-green-600" />
          ) : (
            <AlertCircle className="mr-2 text-red-600" />
          )}
          <span
            className={
              operationResult.success ? "text-green-700" : "text-red-700"
            }
          >
            {operationResult.message}
          </span>
        </div>
      )}

      {/* Filters at the top */}
      <div className="mb-4">
        <AdminUnitFilters onChange={handleFilterChange} level={level} />
      </div>

      {/* Add Candidate button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {level.replace(/_/g, " ")} Primaries Election Management
        </h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setEditingCandidate(null);
            setNewCandidate({
              level,
              electionType: 'PRIMARIES'
            });
          }}
          className="py-2.5 px-5 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
        >
          Add New Candidate
        </button>
      </div>

      {/* Main content table */}
      {isLoading ? (
        <Loading />
      ) : (
        <GenericPrimariesTable
          candidates={candidates || []}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}{/* Candidate form modal dialog */}
      {isModalOpen && (
        <CandidateFormModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCandidate(null);
            setNewCandidate({});
          }}
          candidate={newCandidate}
          setCandidate={setNewCandidate}
          onSave={editingCandidate ? handleUpdate : handleAdd}
          isEditing={!!editingCandidate}
          title={`${editingCandidate ? "Edit" : "Add"} Candidate for ${level.replace(/_/g, " ")} Level`}
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
          positionFieldName="position"
          categoryFieldName="category"
        />
      )}      {/* Selected candidate viewing modal */}
      {selectedCandidate && (
        <CandidateDetailsModal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          candidate={selectedCandidate}
        />
      )}
    </div>
  );
};

export default PrimariesElectionContainer;
