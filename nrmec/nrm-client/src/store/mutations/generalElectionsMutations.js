import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';

// Fetch NRM candidates for general elections
export const useGetGeneralElectionCandidates = (filters = {}) => {
  return useQuery({
    queryKey: ['generalElections', 'nrmCandidates', filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/general-elections/nrm-candidates', { params: filters });
      return data;
    },
  });
};

// Fetch opposition candidates
export const useGetOppositionCandidates = (nrmCandidateParticipationId) => {
  return useQuery({
    queryKey: ['generalElections', 'oppositionCandidates', nrmCandidateParticipationId],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/general-elections/opposition-candidates', { 
        params: { nrmCandidateParticipationId } 
      });
      return data;
    },
    // Only fetch if we have a nrmCandidateParticipationId
    enabled: !!nrmCandidateParticipationId,
  });
};

// Create a new opposition candidate
export const useCreateOppositionCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (candidateData) => {
      const { data } = await axiosInstance.post('/general-elections/opposition-candidates', candidateData);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries(['generalElections', 'oppositionCandidates', variables.nrmCandidateParticipationId]);
      queryClient.invalidateQueries(['generalElections', 'nrmCandidates']);
    },
  });
};

// Update an opposition candidate
export const useUpdateOppositionCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...candidateData }) => {
      const { data } = await axiosInstance.put(`/general-elections/opposition-candidates/${id}`, candidateData);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries(['generalElections', 'oppositionCandidates', data.nrmCandidateParticipationId]);
    },
  });
};

// Delete an opposition candidate
export const useDeleteOppositionCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await axiosInstance.delete(`/general-elections/opposition-candidates/${id}`);
      return id;
    },
    onSuccess: (_, id) => {
      // Invalidate all opposition candidate queries as we don't know which NRM candidate they belong to
      queryClient.invalidateQueries(['generalElections', 'oppositionCandidates']);
    },
  });
};

// Record votes for NRM candidate
export const useRecordNrmVotes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (voteData) => {
      const { data } = await axiosInstance.post('/general-elections/votes/nrm', voteData);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries(['generalElections', 'votes', 'nrm', variables.candidateParticipationId]);
      queryClient.invalidateQueries(['generalElections', 'nrmCandidates']);
    },
  });
};

// Record votes for opposition candidate
export const useRecordOppositionVotes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (voteData) => {
      const { data } = await axiosInstance.post('/general-elections/votes/opposition', voteData);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries(['generalElections', 'votes', 'opposition', variables.oppositionCandidateParticipationId]);
      queryClient.invalidateQueries(['generalElections', 'oppositionCandidates']);
    },
  });
};

// Fetch votes for a candidate (NRM or opposition)
export const useGetCandidateVotes = (type, id) => {
  return useQuery({
    queryKey: ['generalElections', 'votes', type, id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/general-elections/votes/${type}/${id}`);
      return data;
    },
    // Only fetch if we have both type and id
    enabled: !!type && !!id,
  });
};

// Update a vote record
export const useUpdateVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...voteData }) => {
      const { data } = await axiosInstance.put(`/general-elections/votes/${id}`, voteData);
      return data;
    },
    onSuccess: () => {
      // Invalidate all vote related queries as we don't know which candidate they belong to
      queryClient.invalidateQueries(['generalElections', 'votes']);
      queryClient.invalidateQueries(['generalElections', 'nrmCandidates']);
      queryClient.invalidateQueries(['generalElections', 'oppositionCandidates']);
    },
  });
};

// Delete a vote record
export const useDeleteVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await axiosInstance.delete(`/general-elections/votes/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalidate all vote related queries as we don't know which candidate they belong to
      queryClient.invalidateQueries(['generalElections', 'votes']);
      queryClient.invalidateQueries(['generalElections', 'nrmCandidates']);
      queryClient.invalidateQueries(['generalElections', 'oppositionCandidates']);
    },
  });
};
