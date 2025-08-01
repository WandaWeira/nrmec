import React, { useState, useEffect } from "react";
import { X, Vote } from "lucide-react";

interface CandidateParticipation {
  id: number;
  candidateId: number;
  electionType: string;
  level: string;
  positionPath: string;
  category: string;
  position: string;
  candidate?: {
    id: number;
    firstName: string;
    lastName: string;
    ninNumber: string;
    phoneNumber: string;
    gender?: string;
  };
  votes?: Array<{
    id: number;
    votes: number;
    notes?: string;
    recordedBy?: number;
    updatedBy?: number;
    createdAt: string;
    updatedAt: string;
  }>;
  region?: { id: number; name: string; };
  subregion?: { id: number; name: string; };
  district?: { id: number; name: string; };
  constituencyMunicipality?: { id: number; name: string; };
  subcountyDivision?: { id: number; name: string; };
  parishWard?: { id: number; name: string; };
  villageCell?: { id: number; name: string; };
}

interface VoteEntryModalProps {
  candidate: CandidateParticipation;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (voteData: { votes: number; notes?: string }) => void;
}

const VoteEntryModal: React.FC<VoteEntryModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [votes, setVotes] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ votes?: string; notes?: string }>({});

  // Get existing vote data for this candidate
  const existingVote = candidate.votes && candidate.votes.length > 0 
    ? candidate.votes[candidate.votes.length - 1] 
    : null;

  // Pre-fill form with existing data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingVote) {
        setVotes(existingVote.votes.toString());
        setNotes(existingVote.notes || "");
      } else {
        setVotes("");
        setNotes("");
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, existingVote]);

  // Validation
  const validateForm = () => {
    const newErrors: { votes?: string; notes?: string } = {};

    if (!votes.trim()) {
      newErrors.votes = "Vote count is required";
    } else if (isNaN(Number(votes)) || Number(votes) < 0) {
      newErrors.votes = "Vote count must be a valid non-negative number";
    } else if (!Number.isInteger(Number(votes))) {
      newErrors.votes = "Vote count must be a whole number";
    }

    if (notes.length > 500) {
      newErrors.notes = "Notes cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        votes: Number(votes),
        notes: notes.trim() || undefined,
      });
    } catch (error) {
      console.error("Error submitting vote:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes with validation
  const handleVotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setVotes(value);
    
    // Clear vote error when user starts typing
    if (errors.votes) {
      setErrors(prev => ({ ...prev, votes: undefined }));
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    
    // Clear notes error when user starts typing
    if (errors.notes) {
      setErrors(prev => ({ ...prev, notes: undefined }));
    }
  };

  // Get administrative unit display name
  const getAdministrativeUnit = () => {
    if (candidate.villageCell) return candidate.villageCell.name;
    if (candidate.parishWard) return candidate.parishWard.name;
    if (candidate.subcountyDivision) return candidate.subcountyDivision.name;
    if (candidate.constituencyMunicipality) return candidate.constituencyMunicipality.name;
    if (candidate.district) return candidate.district.name;
    if (candidate.subregion) return candidate.subregion.name;
    if (candidate.region) return candidate.region.name;
    return "National";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Vote className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              {existingVote ? "Update Votes" : "Record Votes"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Candidate Information */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Candidate Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Name</div>
              <div className="font-medium text-gray-900">
                {candidate.candidate?.firstName} {candidate.candidate?.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">NIN Number</div>
              <div className="font-medium text-gray-900">
                {candidate.candidate?.ninNumber || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Position</div>
              <div className="font-medium text-gray-900">{candidate.position}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Category</div>
              <div className="font-medium text-gray-900">{candidate.category}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Administrative Unit</div>
              <div className="font-medium text-gray-900">{getAdministrativeUnit()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Phone Number</div>
              <div className="font-medium text-gray-900">
                {candidate.candidate?.phoneNumber || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Vote History */}
        {candidate.votes && candidate.votes.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vote History</h3>
            <div className="space-y-3">
              {candidate.votes.map((vote, index) => (
                <div key={vote.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-blue-600">
                        {vote.votes} votes
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(vote.createdAt).toLocaleDateString()} at{" "}
                        {new Date(vote.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {index === candidate.votes!.length - 1 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                  {vote.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {vote.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vote Entry Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Vote Count */}
            <div>
              <label htmlFor="votes" className="block text-sm font-medium text-gray-700 mb-2">
                Vote Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="votes"
                min="0"
                step="1"
                value={votes}
                onChange={handleVotesChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.votes 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Enter number of votes"
                disabled={isSubmitting}
              />
              {errors.votes && (
                <p className="mt-1 text-sm text-red-600">{errors.votes}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={handleNotesChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.notes 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Add any additional notes about these votes..."
                disabled={isSubmitting}
              />
              <div className="mt-1 flex justify-between items-center">
                {errors.notes ? (
                  <p className="text-sm text-red-600">{errors.notes}</p>
                ) : (
                  <div></div>
                )}
                <span className={`text-xs ${notes.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                  {notes.length}/500
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {existingVote ? "Updating..." : "Recording..."}
                </div>
              ) : (
                existingVote ? "Update Votes" : "Record Votes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoteEntryModal;
