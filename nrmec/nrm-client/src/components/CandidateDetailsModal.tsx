import React from "react";
import CandidateBiographyModal from "./nominations/CandidateBiographyModal";

interface CandidateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
}

const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({
  isOpen,
  onClose,
  candidate,
}) => {
  // Use the new enhanced biography modal
  return (
    <CandidateBiographyModal
      isOpen={isOpen}
      onClose={onClose}
      candidate={candidate}
    />
  );
};

export default CandidateDetailsModal;
