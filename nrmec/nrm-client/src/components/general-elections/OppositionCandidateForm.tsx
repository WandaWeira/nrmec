import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Grid, Typography, MenuItem, 
  IconButton, Box, Paper 
} from '@mui/material';
import { X } from 'lucide-react';
import { useCreateOppositionCandidate } from '../../store/mutations/generalElectionsMutations';

interface OppositionCandidateFormProps {
  open: boolean;
  onClose: () => void;
  nrmCandidateParticipation: any;
}

const OppositionCandidateForm: React.FC<OppositionCandidateFormProps> = ({ 
  open, 
  onClose, 
  nrmCandidateParticipation 
}) => {
  const [formData, setFormData] = useState({
    ninNumber: '',
    firstName: '',
    lastName: '',
    gender: '',
    phoneNumber: '',
    party: '',
  });

  const createOppositionMutation = useCreateOppositionCandidate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      nrmCandidateParticipationId: nrmCandidateParticipation.id,
      level: nrmCandidateParticipation.level,
      positionPath: nrmCandidateParticipation.positionPath,
      category: nrmCandidateParticipation.category,
      position: nrmCandidateParticipation.position,
      regionId: nrmCandidateParticipation.regionId,
      districtId: nrmCandidateParticipation.districtId,
      constituencyMunicipalityId: nrmCandidateParticipation.constituencyMunicipalityId,
      subcountyDivisionId: nrmCandidateParticipation.subcountyDivisionId,
      parishWardId: nrmCandidateParticipation.parishWardId,
      villageCellId: nrmCandidateParticipation.villageCellId,
      year: nrmCandidateParticipation.year
    };

    createOppositionMutation.mutate(payload, {
      onSuccess: () => {
        setFormData({
          ninNumber: '',
          firstName: '',
          lastName: '',
          gender: '',
          phoneNumber: '',
          party: '',
        });
        onClose();
      }
    });
  };
  
  const politicalParties = [
    "DP (Democratic Party)",
    "FDC (Forum for Democratic Change)",
    "NUP (National Unity Platform)",
    "UPC (Uganda People's Congress)",
    "JEEMA (Justice Forum)",
    "PPP (People's Progressive Party)",
    "CP (Conservative Party)",
    "ANT (Alliance for National Transformation)",
    "Independent",
    "Other"
  ];

  if (!nrmCandidateParticipation) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Add Opposition Candidate
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
        </Box>
      
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="NIN Number"
                name="ninNumber"
                value={formData.ninNumber}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                select
                fullWidth
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                select
                fullWidth
                label="Political Party"
                name="party"
                value={formData.party}
                onChange={handleChange}
                variant="outlined"
                size="small"
              >
                {politicalParties.map((party) => (
                  <MenuItem key={party} value={party}>
                    {party}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={createOppositionMutation.isPending}
        >
          {createOppositionMutation.isPending ? 'Saving...' : 'Save Opposition Candidate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OppositionCandidateForm;
