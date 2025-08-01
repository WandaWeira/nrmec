import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, IconButton, Box, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress 
} from '@mui/material';
import { X, Edit, Trash2, Vote } from 'lucide-react';
import { 
  useGetOppositionCandidates, 
  useDeleteOppositionCandidate,
  useRecordOppositionVotes
} from '../../store/mutations/generalElectionsMutations';

interface OppositionCandidatesViewProps {
  open: boolean;
  onClose: () => void;
  nrmCandidateParticipation: any;
}

interface VoteFormProps {
  open: boolean;
  onClose: () => void;
  oppositionCandidate: any;
}

// Vote entry form component
const VoteForm: React.FC<VoteFormProps> = ({ open, onClose, oppositionCandidate }) => {
  const [votes, setVotes] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const recordVotesMutation = useRecordOppositionVotes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      oppositionCandidateParticipationId: oppositionCandidate.id,
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

  if (!oppositionCandidate) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Record Votes for Opposition Candidate
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
              Candidate: {oppositionCandidate.oppositionCandidate?.firstName} {oppositionCandidate.oppositionCandidate?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Party: {oppositionCandidate.oppositionCandidate?.party}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Position: {oppositionCandidate.position}
            </Typography>
          </Paper>
        
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box mb={2}>
              <Typography variant="subtitle2" mb={1}>
                Votes Received
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
            
            <Box mb={2}>
              <Typography variant="subtitle2" mb={1}>
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

const OppositionCandidatesView: React.FC<OppositionCandidatesViewProps> = ({ 
  open, 
  onClose, 
  nrmCandidateParticipation 
}) => {
  const [selectedOppositionCandidate, setSelectedOppositionCandidate] = useState(null);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  
  const { data: oppositionCandidates, isLoading } = useGetOppositionCandidates(
    nrmCandidateParticipation?.id
  );
  
  const deleteOppositionMutation = useDeleteOppositionCandidate();

  const handleDeleteOppositionCandidate = (id: number) => {
    if (window.confirm('Are you sure you want to delete this opposition candidate?')) {
      deleteOppositionMutation.mutate(id);
    }
  };

  const handleOpenVoteModal = (oppositionCandidate: any) => {
    setSelectedOppositionCandidate(oppositionCandidate);
    setVoteModalOpen(true);
  };

  const handleCloseVoteModal = () => {
    setVoteModalOpen(false);
    setSelectedOppositionCandidate(null);
  };

  if (!nrmCandidateParticipation) return null;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Opposition Candidates
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
                NRM Candidate: {nrmCandidateParticipation.candidate?.firstName} {nrmCandidateParticipation.candidate?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Position: {nrmCandidateParticipation.position}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Level: {nrmCandidateParticipation.level}
              </Typography>
            </Paper>
            
            {isLoading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : !oppositionCandidates || oppositionCandidates.length === 0 ? (
              <Typography variant="body1" align="center" my={4}>
                No opposition candidates registered for this position
              </Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Party</TableCell>
                      <TableCell>NIN</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Votes</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {oppositionCandidates.map((candidate: any) => {
                      // Calculate total votes
                      const totalVotes = candidate.votes?.reduce(
                        (sum: number, vote: any) => sum + vote.votes, 0
                      ) || 0;
                      
                      return (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            {candidate.oppositionCandidate.firstName} {candidate.oppositionCandidate.lastName}
                          </TableCell>
                          <TableCell>{candidate.oppositionCandidate.party}</TableCell>
                          <TableCell>{candidate.oppositionCandidate.ninNumber}</TableCell>
                          <TableCell>{candidate.oppositionCandidate.phoneNumber}</TableCell>
                          <TableCell>{totalVotes}</TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleOpenVoteModal(candidate)}
                              >
                                <Vote size={16} />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteOppositionCandidate(candidate.id)}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Box>
                          </TableCell>
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
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {selectedOppositionCandidate && (
        <VoteForm 
          open={voteModalOpen}
          onClose={handleCloseVoteModal}
          oppositionCandidate={selectedOppositionCandidate}
        />
      )}
    </>
  );
};

export default OppositionCandidatesView;
