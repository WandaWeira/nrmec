import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface NominationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (candidateId: number, nomination: any) => void;
  candidate: any;
  loading: boolean;
}

const NominationFormModal: React.FC<NominationFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  candidate,
  loading,
}) => {
  const [notes, setNotes] = useState("");
  const [reasonForNomination, setReasonForNomination] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setNotes("");
      setReasonForNomination("");
      setIsConfirmed(false);
      setErrors({});
    }
  }, [open]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!reasonForNomination.trim()) {
      newErrors.reasonForNomination = "Reason for nomination is required";
    }

    if (!isConfirmed) {
      newErrors.isConfirmed = "You must confirm the nomination";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const nominationData = {
      notes,
      reasonForNomination,
      candidateId: candidate.candidateId,
      participationId: candidate.id,
    };

    onSubmit(candidate.candidateId, nominationData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-full max-w-xl">
        <div className="flex justify-between items-center bg-primary-600 text-white p-4">
          <h2 className="text-xl font-bold">Nominate Candidate</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Candidate Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Name:</p>
                <p>{candidate.candidate?.firstName} {candidate.candidate?.lastName}</p>
              </div>
              <div>
                <p className="font-medium">NIN:</p>
                <p>{candidate.candidate?.ninNumber}</p>
              </div>
              <div>
                <p className="font-medium">Position:</p>
                <p>{candidate.position}</p>
              </div>
              <div>
                <p className="font-medium">Category:</p>
                <p>{candidate.category}</p>
              </div>
              <div>
                <p className="font-medium">Level:</p>
                <p>{candidate.level.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="font-medium">Fees Paid:</p>
                <p className={candidate.feesPaid ? "text-green-600" : "text-red-600"}>
                  {candidate.feesPaid ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Reason for Nomination*
              </label>
              <textarea
                className={`w-full p-2 border ${
                  errors.reasonForNomination ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white`}
                rows={4}
                value={reasonForNomination}
                onChange={(e) => setReasonForNomination(e.target.value)}
                placeholder="Enter reason for nomination"
              />
              {errors.reasonForNomination && (
                <p className="mt-1 text-sm text-red-500">{errors.reasonForNomination}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional notes"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="confirmation"
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
              />
              <label htmlFor="confirmation" className="text-sm">
                I confirm that this candidate has met all requirements and is eligible for nomination
              </label>
            </div>
            {errors.isConfirmed && (
              <p className="text-sm text-red-500">{errors.isConfirmed}</p>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !candidate.feesPaid}
              >
                {loading ? "Processing..." : "Nominate Candidate"}
              </button>
            </div>
            
            {!candidate.feesPaid && (
              <p className="text-red-500 text-sm mt-2">
                This candidate cannot be nominated because they have not paid the required fees.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default NominationFormModal;
