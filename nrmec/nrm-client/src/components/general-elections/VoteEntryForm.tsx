import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, IconButton, Box, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress
} from '@mui/material';
import { X } from 'lucide-react';
// Format date using date-fns
import { format } from 'date-fns';
import { 
  useRecordNrmVotes, 
  useGetCandidateVotes,
  useGetOppositionCandidates
} from '../../store/mutations/generalElectionsMutations';

interface VoteEntryFormProps {
  open: boolean;
  onClose: () => void;
  candidate: any;
}

const VoteEntryForm: React.FC<VoteEntryFormProps> = ({ 
  open, 
  onClose, 
  candidate 
}) => {
  const [votes, setVotes] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const recordVotesMutation = useRecordNrmVotes();
  const { 
    data: voteHistory,
    isLoading: isLoadingVoteHistory
  } = useGetCandidateVotes('nrm', candidate?.id);
  
  const {
    data: oppositionCandidates,
    isLoading: isLoadingOpposition
  } = useGetOppositionCandidates(candidate?.id);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setVotes('');
      setNotes('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      candidateParticipationId: candidate.id,
      votes: parseInt(votes),
      notes
    };

    recordVotesMutation.mutate(payload, {
      onSuccess: () => {
        setVotes('');
        setNotes('');
        onClose();
      }
    });
  };

  // Calculate total votes from oppositionCandidates
  const calculateTotalOppositionVotes = () => {
    if (!oppositionCandidates) return 0;
    
    return oppositionCandidates.reduce((total: number, candidate: any) => {
      const candidateVotes = candidate.votes?.reduce(
        (sum: number, vote: any) => sum + vote.votes, 0
      ) || 0;
      return total + candidateVotes;
    }, 0);
  };

  // Calculate total votes from NRM candidate
  const calculateTotalNrmVotes = () => {
    if (!voteHistory) return 0;
    
    return voteHistory.reduce(
      (sum: number, vote: any) => sum + vote.votes, 0
    ) || 0;
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Record Votes for General Election
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box my={2}>
          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              NRM Candidate: {candidate.candidate?.firstName} {candidate.candidate?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Position: {candidate.position}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Level: {candidate.level}
            </Typography>
          </Paper>
          
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Paper elevation={1} sx={{ p: 2, bgcolor: '#e8f4f8' }}>
              <Typography variant="h6" className="font-bold mb-2">
                NRM Votes
              </Typography>
              <Typography variant="h4" className="font-bold text-blue-600">
                {isLoadingVoteHistory ? <CircularProgress size={24} /> : calculateTotalNrmVotes()}
              </Typography>
            </Paper>
            
            <Paper elevation={1} sx={{ p: 2, bgcolor: '#f9f2e8' }}>
              <Typography variant="h6" className="font-bold mb-2">
                Opposition Votes
              </Typography>
              <Typography variant="h4" className="font-bold text-orange-600">
                {isLoadingOpposition ? <CircularProgress size={24} /> : calculateTotalOppositionVotes()}
              </Typography>
            </Paper>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit} className="mb-6">
            <Box className="mb-4">
              <Typography variant="subtitle2" className="mb-1">
                NRM Candidate Votes
              </Typography>
              <input
                type="number"
                value={votes}
                onChange={(e) => setVotes(e.target.value)}
                required
                min="0"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Box>
            
            <Box className="mb-4">
              <Typography variant="subtitle2" className="mb-1">
                Notes (Optional)
              </Typography>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Box>
          </Box>
          
          {/* Vote history table */}
          <Typography variant="h6" className="mb-2">
            Vote History
          </Typography>
          {isLoadingVoteHistory ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          ) : !voteHistory || voteHistory.length === 0 ? (
            <Typography variant="body1" align="center" my={2}>
              No vote history available
            </Typography>
          ) : (
            <TableContainer component={Paper} className="mb-4">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Votes</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Recorded By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {voteHistory.map((vote: any) => (
                    <TableRow key={vote.id}>
                      <TableCell>
                        {format(new Date(vote.createdAt), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell align="right">{vote.votes}</TableCell>
                      <TableCell>{vote.notes || '-'}</TableCell>
                      <TableCell>
                        {vote.recorder ? `${vote.recorder.firstName} ${vote.recorder.lastName}` : 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Opposition candidates summary */}
          <Typography variant="h6" className="mb-2">
            Opposition Candidates
          </Typography>
          {isLoadingOpposition ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          ) : !oppositionCandidates || oppositionCandidates.length === 0 ? (
            <Typography variant="body1" align="center" my={2}>
              No opposition candidates registered
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Party</TableCell>
                    <TableCell align="right">Votes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {oppositionCandidates.map((candidate: any) => {
                    const totalVotes = candidate.votes?.reduce(
                      (sum: number, vote: any) => sum + vote.votes, 0
                    ) || 0;
                    
                    return (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          {candidate.oppositionCandidate.firstName} {candidate.oppositionCandidate.lastName}
                        </TableCell>
                        <TableCell>{candidate.oppositionCandidate.party}</TableCell>
                        <TableCell align="right">{totalVotes}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={recordVotesMutation.isPending}
        >
          {recordVotesMutation.isPending ? 'Saving...' : 'Save Votes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoteEntryForm;
