import {
  Box,
  Button,
  Typography,
  Divider,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  InputAdornment 
} from '@mui/material';
import React, { useState } from 'react';

const QuotationResponseForm = ({ quotation, onSubmit, onCancel }) => {
  const [response, setResponse] = useState('accept');
  const [counterPrice, setCounterPrice] = useState(quotation.metadata.price);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      response,
      counterPrice: response === 'counter' ? parseFloat(counterPrice) : null,
      notes
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Respond to Quotation
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1">Original Quotation</Typography>
        <Typography>Price: {quotation.metadata.currency || '$'} {quotation.metadata.price}</Typography>
        <Typography>Deadline: {new Date(quotation.metadata.deadline).toLocaleDateString()}</Typography>
        <Typography>Deliverables:</Typography>
        <ul>
          {quotation.metadata.deliverables.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Box>
      
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">Your Response</FormLabel>
        <RadioGroup 
          value={response} 
          onChange={(e) => setResponse(e.target.value)}
          row
        >
          <FormControlLabel value="accept" control={<Radio />} label="Accept" />
          <FormControlLabel value="counter" control={<Radio />} label="Counter Offer" />
          <FormControlLabel value="reject" control={<Radio />} label="Reject" />
        </RadioGroup>
      </FormControl>
      
      {response === 'counter' && (
        <TextField
          fullWidth
          label="Your Counter Price"
          type="number"
          value={counterPrice}
          onChange={(e) => setCounterPrice(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">{quotation.metadata.currency || '$'}</InputAdornment>,
          }}
          sx={{ mb: 3 }}
        />
      )}
      
      <TextField
        fullWidth
        label="Response Notes"
        multiline
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        sx={{ mb: 3 }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => {
            const autoCounter = quotation.metadata.price * 0.9;
            setCounterPrice(autoCounter.toFixed(2));
            setResponse('counter');
            setNotes(`I can do this for ${quotation.metadata.currency || '$'}${autoCounter.toFixed(2)}. Let me know if this works for you!`);
          }}
        >
          Auto-Negotiate
        </Button>
        
        <Box>
          <Button onClick={onCancel} sx={{ mr: 1 }} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Send Response
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default QuotationResponseForm;