import { useState } from 'react';
import { useGetCandidateParticipationsQuery } from '../../store/api/payments_api';

interface CandidateParticipation {
  id: number;
  candidateId: number;
  electionType: string;
  level: string;
  positionPath: string;
  category?: string;
  subcategory?: string;
  position: string;
  year: number;
  status: string;
  region?: any;
  subregion?: any;
  district?: any;
  constituencyMunicipality?: any;
  subcountyDivision?: any;
  parishWard?: any;
  villageCell?: any;
  payments?: any[];
}

interface ParticipationSelectorProps {
  candidateId: number;
  onSelectParticipation: (participation: CandidateParticipation) => void;
}

const ParticipationSelector = ({ candidateId, onSelectParticipation }: ParticipationSelectorProps) => {
  const { data: participations = [], isLoading, error } = useGetCandidateParticipationsQuery(candidateId);
  const [selectedParticipationId, setSelectedParticipationId] = useState<number | null>(null);

  const handleSelect = (participation: CandidateParticipation) => {
    setSelectedParticipationId(participation.id);
    onSelectParticipation(participation);
  };

  // Helper function to get administrative unit name
  const getAdminUnitName = (participation: CandidateParticipation) => {
    switch (participation.level) {
      case 'NATIONAL':
        return 'National';
      case 'DISTRICT':
        return participation.district?.name || 'District';
      case 'CONSTITUENCY_MUNICIPALITY':
        return participation.constituencyMunicipality?.name || 'Constituency/Municipality';
      case 'SUBCOUNTY_DIVISION':
        return participation.subcountyDivision?.name || 'Subcounty/Division';
      case 'PARISH_WARD':
        return participation.parishWard?.name || 'Parish/Ward';
      case 'VILLAGE_CELL':
        return participation.villageCell?.name || 'Village/Cell';
      default:
        return 'Unknown';
    }
  };

  // Helper function to format election type for display
  const formatElectionType = (type: string) => {
    switch (type) {
      case 'INTERNAL_PARTY':
        return 'Internal Party';
      case 'PRIMARIES':
        return 'Primaries';
      case 'GENERAL':
        return 'General';
      default:
        return type;
    }
  };

  // Check if participation has any payments
  const hasPayment = (participation: CandidateParticipation) => {
    return participation.payments && participation.payments.length > 0;
  };

  if (isLoading) {
    return <div className="p-4 text-gray-600">Loading participations...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Failed to load participations</div>;
  }

  if (participations.length === 0) {
    return <div className="p-4 text-gray-600">No participations found for this candidate</div>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Position to Pay For</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Election Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {participations.map((participation) => (
              <tr key={participation.id} className={selectedParticipationId === participation.id ? 'bg-yellow-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatElectionType(participation.electionType)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participation.level}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getAdminUnitName(participation)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {participation.category ? `${participation.category} ${participation.position}` : participation.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    hasPayment(participation) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hasPayment(participation) ? 'Paid' : 'Not Paid'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleSelect(participation)}
                    disabled={hasPayment(participation)}
                    className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                      hasPayment(participation)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                    }`}
                  >
                    {hasPayment(participation) ? 'Already Paid' : 'Select for Payment'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParticipationSelector;
