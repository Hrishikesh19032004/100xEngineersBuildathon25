import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

const ContractForm = ({ onCreateContract, onCancel, defaultCreatorId }) => {
  const [contractData, setContractData] = useState({
    creatorId: defaultCreatorId || '',
    productName: '',
    rate: '',
    timeline: ''
  });

  useEffect(() => {
    if (defaultCreatorId) {
      setContractData(prev => ({
        ...prev,
        creatorId: defaultCreatorId
      }));
    }
  }, [defaultCreatorId]);

  const handleChange = (e) => {
    setContractData({
      ...contractData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateContract({
      creatorId: contractData.creatorId,
      product: contractData.productName,
      rate: parseFloat(contractData.rate),
      timeline: contractData.timeline
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Create Contract
      </Typography>
      
      <TextField
        fullWidth
        label="Creator ID"
        name="creatorId"
        value={contractData.creatorId}
        onChange={handleChange}
        margin="normal"
        required
        InputProps={{
          readOnly: !!defaultCreatorId
        }}
      />
      
      <TextField
        fullWidth
        label="Product"
        name="productName"
        value={contractData.productName}
        onChange={handleChange}
        margin="normal"
        required
      />
      
      <TextField
        fullWidth
        label="Rate"
        name="rate"
        type="number"
        value={contractData.rate}
        onChange={handleChange}
        margin="normal"
        required
      />
      
      <TextField
        fullWidth
        label="Timeline"
        name="timeline"
        value={contractData.timeline}
        onChange={handleChange}
        margin="normal"
        required
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 2 }} variant="outlined">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!contractData.productName || !contractData.rate || !contractData.timeline}
        >
          Send Contract
        </Button>
      </Box>
    </Paper>
  );
};

export default ContractForm;