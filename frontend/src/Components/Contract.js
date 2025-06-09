import React from 'react';
import { Box, Typography, Button, Divider, Paper } from '@mui/material';

const Contract = ({ contract, onSignContract }) => {
  const isFullySigned = contract.status === 'fully_signed';
  
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Contract - {contract.product}
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      <Typography variant="body2">Rate: {contract.rate}</Typography>
      <Typography variant="body2">Timeline: {contract.timeline}</Typography>
      <Typography variant="body2">Created: {new Date(contract.createdAt).toLocaleDateString()}</Typography>
      
      {contract.brand_signature && (
        <Typography variant="body2">Brand signed: {new Date(contract.brandSignedAt).toLocaleDateString()}</Typography>
      )}
      
      {contract.influencer_signature && (
        <Typography variant="body2">Influencer signed: {new Date(contract.influencerSignedAt).toLocaleDateString()}</Typography>
      )}
      
      <Typography variant="body1" sx={{ mt: 1 }}>
        Status: {contract.status}
      </Typography>
      
      {!isFullySigned && (
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => onSignContract(contract.id)}
            fullWidth
          >
            Sign Contract
          </Button>
        </Box>
      )}
      
      {isFullySigned && (
        <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
          This contract has been fully signed by both parties.
        </Typography>
      )}
    </Paper>
  );
};

export default Contract;