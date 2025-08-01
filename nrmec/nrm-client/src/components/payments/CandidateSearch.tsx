import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { debounce } from 'lodash';
import { useSearchCandidatesQuery } from '../../store/api/payments_api';

interface Candidate {
  id: number;
  ninNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  phoneNumber: string;
  electionType: string;
}

interface CandidateSearchProps {
  onSelectCandidate: (candidate: Candidate) => void;
}

const CandidateSearch = ({ onSelectCandidate }: CandidateSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Create a debounced function to update the search term
  const debouncedSearch = debounce((term: string) => {
    setDebouncedSearchTerm(term);
  }, 300);

  // Update the debounced search term when the search term changes
  useEffect(() => {
    if (searchTerm.length >= 2) {
      debouncedSearch(searchTerm);
    } else {
      debouncedSearch.cancel();
      setDebouncedSearchTerm('');
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  // Skip the query if the search term is empty or too short
  const { data: candidates = [], isLoading } = useSearchCandidatesQuery(debouncedSearchTerm, {
    skip: debouncedSearchTerm.length < 2,
  });

  console.log("-*-*---*-*-debouncedSearchTerm",debouncedSearchTerm)
  const handleCandidateSelect = (candidate: Candidate) => {
    onSelectCandidate(candidate);
    setSearchTerm(`${candidate.firstName} ${candidate.lastName} - ${candidate.ninNumber}`);
  };

  return (
    <div className="mb-6">
      <label htmlFor="candidateSearch" className="block text-sm font-medium text-gray-700 mb-1">
        Search Candidate (NIN/Name)
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          id="candidateSearch"
          type="text"
          placeholder="Enter NIN or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full p-2 border rounded-lg focus:ring-1 focus:ring-yellow-500"
        />
      </div>
      
      {isLoading && (
        <div className="mt-2 text-gray-500">Searching...</div>
      )}
      
      {debouncedSearchTerm.length >= 2 && candidates.length > 0 && (
        <div className="border rounded-lg max-h-40 overflow-y-auto mt-1">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleCandidateSelect(candidate)}
            >
              {candidate.firstName} {candidate.lastName} - {candidate.ninNumber}
            </div>
          ))}
        </div>
      )}
      
      {debouncedSearchTerm.length >= 2 && candidates.length === 0 && !isLoading && (
        <div className="mt-2 text-gray-500">No candidates found</div>
      )}
    </div>
  );
};

export default CandidateSearch;
