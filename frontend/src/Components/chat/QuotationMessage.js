import React from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Chip,
  Paper,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const QuotationMessage = ({ message, currentUser, onRespond }) => {
  const isBusiness = currentUser.role === 'business';
  const isQuotation = message.message_type === 'quotation';
  const metadata = message.metadata || {};
  const status = metadata.status || 'pending';

  const renderStatus = () => {
    if (isQuotation) {
      return (
        <Chip 
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          color={
            status === 'accepted' ? 'success' : 
            status === 'rejected' ? 'error' : 'warning'
          }
          size="small"
          sx={{ ml: 1 }}
          icon={
            status === 'accepted' ? <CheckCircleIcon /> : 
            status === 'rejected' ? <CancelIcon /> : null
          }
        />
      );
    }
    return null;
  };

  return (
    <Paper elevation={2} sx={{ 
      p: 2, 
      mb: 2, 
      borderLeft: isQuotation ? '4px solid #3f51b5' : '4px solid #4caf50',
      backgroundColor: isQuotation ? '#f5f5f5' : '#f8f8f8'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {isQuotation ? 'Quotation' : 'Quotation Response'}
        </Typography>
        {renderStatus()}
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      {isQuotation ? (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Deliverables:</Typography>
            <ul style={{ marginTop: 4, marginBottom: 4, paddingLeft: 20 }}>
              {metadata.deliverables?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>
              <AttachMoneyIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              <strong>Price:</strong> {metadata.price} {metadata.currency || 'USD'}
            </Typography>
            <Typography>
              <strong>Deadline:</strong> {new Date(metadata.deadline).toLocaleDateString()}
            </Typography>
          </Box>
          
          {metadata.notes && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Notes:</Typography>
              <Typography variant="body2">{metadata.notes}</Typography>
            </Box>
          )}
          
          {!isBusiness && status === 'pending' && (
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button 
                variant="contained" 
                size="small"
                onClick={() => onRespond(message)}
              >
                Respond
              </Button>
            </Box>
          )}
        </>
      ) : (
        <>
          <Typography sx={{ mb: 1 }}>
            <strong>Response:</strong> {metadata.response}
          </Typography>
          
          {metadata.response === 'counter' && (
            <Typography sx={{ mb: 1 }}>
              <strong>Counter Price:</strong> {metadata.counterPrice} {metadata.currency || 'USD'}
            </Typography>
          )}
          
          {metadata.notes && (
            <Typography variant="body2">{metadata.notes}</Typography>
          )}
        </>
      )}
    </Paper>
  );
};

export default QuotationMessage;