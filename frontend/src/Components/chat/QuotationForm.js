import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Divider, 
  IconButton,
  Grid,
  Paper,
  InputAdornment,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const QuotationForm = ({ onSubmit, onCancel }) => {
  const [deliverables, setDeliverables] = useState(['']);
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('USD');

  const handleDeliverableChange = (index, value) => {
    const newDeliverables = [...deliverables];
    newDeliverables[index] = value;
    setDeliverables(newDeliverables);
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, '']);
  };

  const removeDeliverable = (index) => {
    if (deliverables.length > 1) {
      const newDeliverables = deliverables.filter((_, i) => i !== index);
      setDeliverables(newDeliverables);
    }
  };

  const handleSubmit = () => {
    const quotationData = {
      deliverables: deliverables.filter(d => d.trim() !== ''),
      price: parseFloat(price),
      currency,
      deadline: new Date(deadline).toISOString(),
      notes
    };
    onSubmit(quotationData);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Create Quotation
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Deliverables
      </Typography>
      
      {deliverables.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            value={item}
            onChange={(e) => handleDeliverableChange(index, e.target.value)}
            placeholder="Describe the deliverable"
            sx={{ mr: 1 }}
          />
          <IconButton onClick={() => removeDeliverable(index)}>
            <RemoveIcon />
          </IconButton>
        </Box>
      ))}
      
      <Button 
        startIcon={<AddIcon />} 
        onClick={addDeliverable}
        variant="outlined"
        sx={{ mb: 3 }}
      >
        Add Deliverable
      </Button>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Currency"
            select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <MenuItem value="USD">USD ($)</MenuItem>
            <MenuItem value="EUR">EUR (€)</MenuItem>
            <MenuItem value="GBP">GBP (£)</MenuItem>
            <MenuItem value="INR">INR (₹)</MenuItem>
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {currency === 'USD' ? '$' : 
                   currency === 'EUR' ? '€' : 
                   currency === 'GBP' ? '£' : '₹'}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Notes"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 2 }} variant="outlined">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!price || !deadline || deliverables.every(d => !d.trim())}
        >
          Send Quotation
        </Button>
      </Box>
    </Paper>
  );
};

export default QuotationForm;