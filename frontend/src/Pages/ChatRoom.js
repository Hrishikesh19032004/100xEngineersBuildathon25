// import React, { useState, useEffect, useRef } from 'react';
// import ZegoService from '../services/zegoService';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   Container,
//   Box,
//   Typography,
//   TextField,
//   Button,
//   IconButton,
//   Avatar,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   CircularProgress,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from '@mui/material';
// import SendIcon from '@mui/icons-material/Send';
// import VideocamIcon from '@mui/icons-material/Videocam';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
// import SignaturePad from 'react-signature-canvas';
// import ChatService from '../services/chatService';
// import ContractService from '../services/contractService';
// import { useAuth } from '../context/AuthContext';
// import QuotationForm from '../components/chat/QuotationForm';
// import QuotationMessage from '../components/chat/QuotationMessage';
// import QuotationResponseForm from '../components/chat/QuotationResponseForm';
// import ContractForm from '../components/ContractForm';
// import Contract from '../components/Contract';
// import api from '../api';

// function ChatRoom() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { currentUser } = useAuth();

//   const [messages, setMessages] = useState([]);
//   const [contracts, setContracts] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [chatroom, setChatroom] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSending, setIsSending] = useState(false);
//   const [showQuotationForm, setShowQuotationForm] = useState(false);
//   const [respondingToQuotation, setRespondingToQuotation] = useState(null);
//   const [showContractForm, setShowContractForm] = useState(false);
//   const [showSignaturePad, setShowSignaturePad] = useState(false);
//   const [signingContractId, setSigningContractId] = useState(null);
//   const signaturePadRef = useRef(null);

//   const messagesEndRef = useRef(null);
//   const messageBoxRef = useRef(null);
//   const [showScrollButton, setShowScrollButton] = useState(false);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Just now';
//     try {
//       const date = new Date(dateString);
//       return isNaN(date) ? 'Just now' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     } catch {
//       return 'Just now';
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const checkScrollPosition = () => {
//     const box = messageBoxRef.current;
//     if (!box) return;
//     const atBottom = box.scrollHeight - box.scrollTop <= box.clientHeight + 100;
//     setShowScrollButton(!atBottom);
//   };

//   useEffect(() => {
//     const fetchChatroomData = async () => {
//       try {
//         const chatroomData = await ChatService.getChatroom(id);
//         setChatroom(chatroomData);
//         const messagesData = await ChatService.getMessages(id);
//         setMessages(messagesData);

//         const contractResponse = await ContractService.getContractsForChatroom(id);
//         setContracts(contractResponse.contracts);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to load chatroom');
//         setLoading(false);
//       }
//     };

//     fetchChatroomData();

//     const intervalId = setInterval(async () => {
//       try {
//         const newMessages = await ChatService.getMessages(id, messages.length);
//         const filteredMessages = newMessages.filter(
//           msg => !messages.some(m => m.id === msg.id)
//         );
//         if (filteredMessages.length > 0) {
//           setMessages(prev => [...prev, ...filteredMessages]);
//         }
//       } catch (err) {
//         console.error('Failed to fetch new messages', err);
//       }
//     }, 15000);

//     return () => clearInterval(intervalId);
//   }, [id, messages]);

//   const handleSendMessage = async () => {
//     if (!newMessage.trim() || isSending) return;
//     setIsSending(true);
//     const tempMessage = {
//       id: Date.now(),
//       content: newMessage,
//       sender_id: currentUser.id,
//       created_at: new Date().toISOString(),
//       isTemp: true
//     };
//     setMessages(prev => [...prev, tempMessage]);
//     setNewMessage('');

//     try {
//       const sentMessage = await ChatService.sendMessage(id, newMessage);
//       setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? { ...sentMessage, isTemp: false } : msg));
//     } catch (err) {
//       console.error('Failed to send message', err);
//       setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
//     }
//     setIsSending(false);
//   };

//   const handleSendQuotation = async (quotationData) => {
//     try {
//       const sentQuotation = await ChatService.sendQuotation(id, quotationData);
//       setMessages(prev => [...prev, sentQuotation]);
//       setShowQuotationForm(false);
//     } catch (err) {
//       console.error('Failed to send quotation:', err);
//     }
//   };

//   const handleRespondToQuotation = async (quotationId, responseData) => {
//     try {
//       const response = await ChatService.respondToQuotation(quotationId, responseData);
//       setMessages(prev => [...prev, response]);
//       setRespondingToQuotation(null);
//     } catch (err) {
//       console.error('Failed to respond to quotation:', err);
//     }
//   };

//   // Instead of prompt, open signature pad dialog
//   const handleSignContract = (contractId) => {
//     setSigningContractId(contractId);
//     setShowSignaturePad(true);
//   };

//   const clearSignature = () => {
//     signaturePadRef.current.clear();
//   };

//   const submitSignature = async () => {
//     if (signaturePadRef.current.isEmpty()) {
//       alert('Please provide a signature before submitting.');
//       return;
//     }
  
//     // ✅ Use getCanvas instead of getTrimmedCanvas
//     const signatureDataURL = signaturePadRef.current.getCanvas().toDataURL('image/png');
  
//     try {
//       const rolePath = currentUser.role === 'business' ? 'sign-business' : 'sign-creator';
//       await api.post(`http://localhost:5000/api/contract/${rolePath}/${signingContractId}`, { signature: signatureDataURL });
//       const updatedContracts = await ContractService.getContractsForChatroom(id);
//       setContracts(updatedContracts.contracts);
//       setShowSignaturePad(false);
//       setSigningContractId(null);
//     } catch (error) {
//       console.error('Error signing contract:', error);
//       alert('Failed to sign contract. Please try again.');
//     }
//   };
  

//   const handleCreateContract = async (contractData) => {
//     try {
//       const response = await api.post('http://localhost:5000/api/contract/create', contractData);
//       setContracts(prev => [...prev, response.data]);
//       setShowContractForm(false);
//     } catch (error) {
//       console.error('Error creating contract:', error);
//     }
//   };

//   const startVideoCall = async () => {
//     try {
//       const tokenData = await ZegoService.generateToken(id);
//       alert(`Video call started! Room ID: chatroom_${id}`);
//     } catch (err) {
//       console.error('Failed to start video call', err);
//     }
//   };

//   if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
//   if (error) return <Container maxWidth="sm"><Typography color="error">{error}</Typography></Container>;

//   const otherUser = chatroom.business_id === currentUser.id ? {
//     id: chatroom.creator_id,
//     username: chatroom.creator_username,
//     avatar: chatroom.creator_profile?.avatar
//   } : {
//     id: chatroom.business_id,
//     username: chatroom.business_username,
//     avatar: chatroom.business_profile?.avatar
//   };

//   return (
//     <Container maxWidth="md">
//       <Box display="flex" alignItems="center" mb={3} mt={3}>
//         <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
//         <Avatar src={otherUser.avatar} sx={{ mx: 2 }} />
//         <Typography variant="h5">{otherUser.username}</Typography>
//         <Box flexGrow={1} />
//         {/* <Button variant="contained" color="secondary" startIcon={<VideocamIcon />} onClick={startVideoCall}>
//           Video Call
//         </Button> */}
//       </Box>

//       {showQuotationForm && (
//         <QuotationForm
//           onSubmit={handleSendQuotation}
//           onCancel={() => setShowQuotationForm(false)}
//         />
//       )}

//       {respondingToQuotation && (
//         <QuotationResponseForm
//           quotation={respondingToQuotation}
//           onSubmit={handleRespondToQuotation}
//           onCancel={() => setRespondingToQuotation(null)}
//         />
//       )}

//       {showContractForm && chatroom && (
//         <ContractForm 
//           onCreateContract={handleCreateContract} 
//           onCancel={() => setShowContractForm(false)} 
//           defaultCreatorId={chatroom.creator_id}
//         />
//       )}

//       {currentUser.role === 'business' && !showQuotationForm && !showContractForm && !respondingToQuotation && (
//         <>
//           <Button 
//             variant="outlined" 
//             startIcon={<AttachMoneyIcon />}
//             onClick={() => setShowQuotationForm(true)}
//             sx={{ mb: 2 }}
//           >
//             Create Quotation
//           </Button>

//           <Button 
//             variant="outlined" 
//             startIcon={<AttachMoneyIcon />}
//             onClick={() => setShowContractForm(true)}
//             sx={{ mb: 2 }}
//           >
//             Create Contract
//           </Button>
//         </>
//       )}

//       <Box 
//         ref={messageBoxRef}
//         sx={{ height: '60vh', overflowY: 'auto', bgcolor: 'background.paper', borderRadius: 2, p: 2, mb: 2 }}
//         onScroll={checkScrollPosition}
//       >
//         {messages.length === 0 && contracts.length === 0 ? (
//           <Typography textAlign="center" color="text.secondary">No messages or contracts yet. Start the conversation!</Typography>
//         ) : (
//           <List>
//             {messages.map((message) => {
//               const isCurrentUser = currentUser && message.sender_id === currentUser.id;

//               if (message.message_type === 'quotation' || message.message_type === 'quotation_response') {
//                 return (
//                   <QuotationMessage
//                     key={message.id}
//                     message={message}
//                     currentUser={currentUser}
//                     onRespond={setRespondingToQuotation}
//                   />
//                 );
//               }

//               return (
//                 <ListItem key={message.id} sx={{ justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}>
//                   {!isCurrentUser && (
//                     <ListItemAvatar>
//                       <Avatar src={otherUser.avatar} />
//                     </ListItemAvatar>
//                   )}
//                   <ListItemText
//                     primary={message.content}
//                     secondary={formatDate(message.created_at)}
//                     sx={{
//                       bgcolor: isCurrentUser ? 'primary.light' : 'grey.200',
//                       borderRadius: 2,
//                       p: 1.5,
//                       maxWidth: '70%',
//                       color: isCurrentUser ? 'common.white' : 'text.primary',
//                       textAlign: isCurrentUser ? 'right' : 'left'
//                     }}
//                   />
//                 </ListItem>
//               );
//             })}
//             {contracts.map(contract => (
//               <Contract 
//                 key={contract.id}
//                 contract={contract}
//                 onSignContract={handleSignContract}
//               />
//             ))}
//             <div ref={messagesEndRef} />
//           </List>
//         )}
//       </Box>

//       {showScrollButton && (
//         <Button 
//           onClick={scrollToBottom} 
//           variant="contained" 
//           color="primary" 
//           fullWidth
//           sx={{ mb: 2 }}
//         >
//           Scroll to Bottom
//         </Button>
//       )}

//       {!showQuotationForm && !showContractForm && !respondingToQuotation && (
//         <Box display="flex">
//           <TextField
//             fullWidth
//             variant="outlined"
//             placeholder="Type a message..."
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//           />
//           <IconButton 
//             color="primary" 
//             onClick={handleSendMessage} 
//             disabled={!newMessage.trim() || isSending}
//             sx={{ ml: 1 }}
//           >
//             {isSending ? <CircularProgress size={24} /> : <SendIcon />}
//           </IconButton>
//         </Box>
//       )}

//       {/* Signature Pad Dialog */}
//       <Dialog open={showSignaturePad} onClose={() => setShowSignaturePad(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>Sign Contract</DialogTitle>
//         <DialogContent>
//           <Box
//             sx={{
//               border: '1px solid #ccc',
//               borderRadius: 1,
//               height: 200,
//             }}
//           >
//             <SignaturePad
//               ref={signaturePadRef}
//               canvasProps={{ width: 500, height: 200, style: { width: '100%', height: 200 } }}
//               backgroundColor="white"
//               penColor="black"
//             />
//           </Box>
//           <Box mt={1} display="flex" justifyContent="space-between">
//             <Button variant="outlined" onClick={clearSignature}>Clear</Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setShowSignaturePad(false)}>Cancel</Button>
//           <Button variant="contained" onClick={submitSignature}>Submit Signature</Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   );
// }

// export default ChatRoom;
import React, { useState, useEffect, useRef } from 'react';
import ZegoService from '../services/zegoService';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import VideocamIcon from '@mui/icons-material/Videocam';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SignaturePad from 'react-signature-canvas';
import ChatService from '../services/chatService';
import ContractService from '../services/contractService';
import { useAuth } from '../context/AuthContext';
import QuotationForm from '../components/chat/QuotationForm';
import QuotationMessage from '../components/chat/QuotationMessage';
import QuotationResponseForm from '../components/chat/QuotationResponseForm';
import ContractForm from '../components/ContractForm';
import Contract from '../components/Contract';
import api from '../api';

// Dark theme matching Home.js
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#a855f7', // purple-500
      light: '#c084fc', // purple-400
    },
    secondary: {
      main: '#ec4899', // pink-500
    },
    background: {
      default: '#111827', // gray-900
      paper: 'rgba(31, 41, 55, 0.5)', // gray-800/50 with transparency
    },
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af', // gray-400
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(to right, #9333ea, #ec4899)',
          '&:hover': {
            background: 'linear-gradient(to right, #7c3aed, #db2777)',
            transform: 'scale(1.02)',
          },
          transition: 'all 0.3s ease',
        },
        outlined: {
          borderColor: '#6b7280',
          color: '#d1d5db',
          '&:hover': {
            borderColor: '#9ca3af',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(31, 41, 55, 0.7)',
            borderRadius: '0.5rem',
            '& fieldset': {
              borderColor: '#4b5563',
            },
            '&:hover fieldset': {
              borderColor: '#6b7280',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#a855f7',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1f2937',
          borderRadius: '1rem',
          border: '1px solid rgba(156, 163, 175, 0.2)',
        },
      },
    },
  },
});

function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatroom, setChatroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [respondingToQuotation, setRespondingToQuotation] = useState(null);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signingContractId, setSigningContractId] = useState(null);
  const signaturePadRef = useRef(null);

  const messagesEndRef = useRef(null);
  const messageBoxRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return isNaN(date) ? 'Just now' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkScrollPosition = () => {
    const box = messageBoxRef.current;
    if (!box) return;
    const atBottom = box.scrollHeight - box.scrollTop <= box.clientHeight + 100;
    setShowScrollButton(!atBottom);
  };

  useEffect(() => {
    const fetchChatroomData = async () => {
      try {
        const chatroomData = await ChatService.getChatroom(id);
        setChatroom(chatroomData);
        const messagesData = await ChatService.getMessages(id);
        setMessages(messagesData);

        const contractResponse = await ContractService.getContractsForChatroom(id);
        setContracts(contractResponse.contracts);
        setLoading(false);
      } catch (err) {
        setError('Failed to load chatroom');
        setLoading(false);
      }
    };

    fetchChatroomData();

    const intervalId = setInterval(async () => {
      try {
        const newMessages = await ChatService.getMessages(id, messages.length);
        const filteredMessages = newMessages.filter(
          msg => !messages.some(m => m.id === msg.id)
        );
        if (filteredMessages.length > 0) {
          setMessages(prev => [...prev, ...filteredMessages]);
        }
      } catch (err) {
        console.error('Failed to fetch new messages', err);
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, [id, messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    const tempMessage = {
      id: Date.now(),
      content: newMessage,
      sender_id: currentUser.id,
      created_at: new Date().toISOString(),
      isTemp: true
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const sentMessage = await ChatService.sendMessage(id, newMessage);
      setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? { ...sentMessage, isTemp: false } : msg));
    } catch (err) {
      console.error('Failed to send message', err);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
    setIsSending(false);
  };

  const handleSendQuotation = async (quotationData) => {
    try {
      const sentQuotation = await ChatService.sendQuotation(id, quotationData);
      setMessages(prev => [...prev, sentQuotation]);
      setShowQuotationForm(false);
    } catch (err) {
      console.error('Failed to send quotation:', err);
    }
  };

  const handleRespondToQuotation = async (quotationId, responseData) => {
    try {
      const response = await ChatService.respondToQuotation(quotationId, responseData);
      setMessages(prev => [...prev, response]);
      setRespondingToQuotation(null);
    } catch (err) {
      console.error('Failed to respond to quotation:', err);
    }
  };

  const handleSignContract = (contractId) => {
    setSigningContractId(contractId);
    setShowSignaturePad(true);
  };

  const clearSignature = () => {
    signaturePadRef.current.clear();
  };

  const submitSignature = async () => {
    if (signaturePadRef.current.isEmpty()) {
      alert('Please provide a signature before submitting.');
      return;
    }
  
    const signatureDataURL = signaturePadRef.current.getCanvas().toDataURL('image/png');
  
    try {
      const rolePath = currentUser.role === 'business' ? 'sign-business' : 'sign-creator';
      await api.post(`http://localhost:5000/api/contract/${rolePath}/${signingContractId}`, { signature: signatureDataURL });
      const updatedContracts = await ContractService.getContractsForChatroom(id);
      setContracts(updatedContracts.contracts);
      setShowSignaturePad(false);
      setSigningContractId(null);
    } catch (error) {
      console.error('Error signing contract:', error);
      alert('Failed to sign contract. Please try again.');
    }
  };

  const handleCreateContract = async (contractData) => {
    try {
      const response = await api.post('http://localhost:5000/api/contract/create', contractData);
      setContracts(prev => [...prev, response.data]);
      setShowContractForm(false);
    } catch (error) {
      console.error('Error creating contract:', error);
    }
  };

  const startVideoCall = async () => {
    try {
      const tokenData = await ZegoService.generateToken(id);
      alert(`Video call started! Room ID: chatroom_${id}`);
    } catch (err) {
      console.error('Failed to start video call', err);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <CircularProgress sx={{ color: '#a855f7', mb: 2 }} size={48} />
            <Typography variant="h6" sx={{ color: '#d1d5db' }}>Loading conversation...</Typography>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center p-8 rounded-xl bg-gray-800/50 border border-red-500/20">
            <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>{error}</Typography>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const otherUser = chatroom.business_id === currentUser.id ? {
    id: chatroom.creator_id,
    username: chatroom.creator_username,
    avatar: chatroom.creator_profile?.avatar
  } : {
    id: chatroom.business_id,
    username: chatroom.business_username,
    avatar: chatroom.business_profile?.avatar
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        {/* Animated Background - matching Home.js */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-lg animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-pink-500/20 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-blue-500/15 rounded-full blur-lg animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-60 right-1/3 w-20 h-20 bg-purple-400/25 rounded-full blur-md animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>

        <Container maxWidth="md" sx={{ py: 3, position: 'relative', zIndex: 10 }}>
          {/* Header */}
          <Box 
            display="flex" 
            alignItems="center" 
            mb={3} 
            sx={{ 
              p: 3,
              background: 'rgba(31, 41, 55, 0.7)',
              backdropFilter: 'blur(12px)',
              borderRadius: '1rem',
              border: '1px solid rgba(156, 163, 175, 0.2)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
            }}
          >
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ 
                color: '#d1d5db',
                '&:hover': { 
                  backgroundColor: 'rgba(156, 163, 175, 0.1)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Avatar 
              src={otherUser.avatar} 
              sx={{ 
                mx: 2, 
                width: 48, 
                height: 48,
                border: '2px solid rgba(168, 85, 247, 0.3)'
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                background: 'linear-gradient(to right, #a855f7, #ec4899)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 'bold'
              }}
            >
              {otherUser.username}
            </Typography>
            <Box flexGrow={1} />
          </Box>

          {/* Forms */}
          {showQuotationForm && (
            <Box sx={{ mb: 3 }}>
              <QuotationForm
                onSubmit={handleSendQuotation}
                onCancel={() => setShowQuotationForm(false)}
              />
            </Box>
          )}

          {respondingToQuotation && (
            <Box sx={{ mb: 3 }}>
              <QuotationResponseForm
                quotation={respondingToQuotation}
                onSubmit={handleRespondToQuotation}
                onCancel={() => setRespondingToQuotation(null)}
              />
            </Box>
          )}

          {showContractForm && chatroom && (
            <Box sx={{ mb: 3 }}>
              <ContractForm 
                onCreateContract={handleCreateContract} 
                onCancel={() => setShowContractForm(false)} 
                defaultCreatorId={chatroom.creator_id}
              />
            </Box>
          )}

          {/* Action Buttons */}
          {currentUser.role === 'business' && !showQuotationForm && !showContractForm && !respondingToQuotation && (
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 3,
                p: 2,
                background: 'rgba(31, 41, 55, 0.5)',
                borderRadius: '1rem',
                border: '1px solid rgba(156, 163, 175, 0.1)'
              }}
            >
              <Button 
                variant="outlined" 
                startIcon={<AttachMoneyIcon />}
                onClick={() => setShowQuotationForm(true)}
                sx={{ flex: 1 }}
              >
                Create Quotation
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<AttachMoneyIcon />}
                onClick={() => setShowContractForm(true)}
                sx={{ flex: 1 }}
              >
                Create Contract
              </Button>
            </Box>
          )}

          {/* Messages Container */}
          <Box 
            ref={messageBoxRef}
            onScroll={checkScrollPosition}
            sx={{ 
              height: '60vh', 
              overflowY: 'auto',
              background: 'rgba(31, 41, 55, 0.7)',
              backdropFilter: 'blur(12px)',
              borderRadius: '1rem',
              border: '1px solid rgba(156, 163, 175, 0.2)',
              mb: 2,
              position: 'relative',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(75, 85, 99, 0.3)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'linear-gradient(to bottom, #a855f7, #ec4899)',
                borderRadius: '4px',
              },
            }}
          >
            {messages.length === 0 && contracts.length === 0 ? (
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                height="100%"
                flexDirection="column"
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#9ca3af', 
                    mb: 1,
                    textAlign: 'center'
                  }}
                >
                  No messages yet
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b7280',
                    textAlign: 'center'
                  }}
                >
                  Start the conversation and make something amazing happen!
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 2 }}>
                {messages.map((message) => {
                  const isCurrentUser = currentUser && message.sender_id === currentUser.id;

                  if (message.message_type === 'quotation' || message.message_type === 'quotation_response') {
                    return (
                      <QuotationMessage
                        key={message.id}
                        message={message}
                        currentUser={currentUser}
                        onRespond={setRespondingToQuotation}
                      />
                    );
                  }

                  return (
                    <ListItem 
                      key={message.id} 
                      sx={{ 
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      {!isCurrentUser && (
                        <ListItemAvatar>
                          <Avatar 
                            src={otherUser.avatar}
                            sx={{ 
                              border: '2px solid rgba(156, 163, 175, 0.2)'
                            }}
                          />
                        </ListItemAvatar>
                      )}
                      <Box
                        sx={{
                          maxWidth: '70%',
                          p: 2,
                          borderRadius: '1rem',
                          background: isCurrentUser 
                            ? 'linear-gradient(135deg, #a855f7, #ec4899)' 
                            : 'rgba(75, 85, 99, 0.5)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(156, 163, 175, 0.1)',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: isCurrentUser ? '#ffffff' : '#d1d5db',
                            mb: 0.5,
                            wordBreak: 'break-word'
                          }}
                        >
                          {message.content}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isCurrentUser ? 'rgba(255,255,255,0.7)' : '#9ca3af',
                            display: 'block',
                            textAlign: isCurrentUser ? 'right' : 'left'
                          }}
                        >
                          {formatDate(message.created_at)}
                        </Typography>
                      </Box>
                    </ListItem>
                  );
                })}
                {contracts.map(contract => (
                  <Contract 
                    key={contract.id}
                    contract={contract}
                    onSignContract={handleSignContract}
                  />
                ))}
                <div ref={messagesEndRef} />
              </List>
            )}
          </Box>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <Button 
              onClick={scrollToBottom} 
              variant="contained" 
              fullWidth
              sx={{ 
                mb: 2,
                py: 1.5,
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8))',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(156, 163, 175, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                }
              }}
            >
              ↓ Scroll to Bottom
            </Button>
          )}

          {/* Message Input */}
          {!showQuotationForm && !showContractForm && !respondingToQuotation && (
            <Box 
              display="flex" 
              gap={1}
              sx={{
                p: 2,
                background: 'rgba(31, 41, 55, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '1rem',
                border: '1px solid rgba(156, 163, 175, 0.2)',
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                multiline
                maxRows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(75, 85, 99, 0.5)',
                  }
                }}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || isSending}
                sx={{ 
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  color: 'white',
                  width: 48,
                  height: 48,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #9333ea, #db2777)',
                    transform: 'scale(1.05)',
                  },
                  '&:disabled': {
                    background: 'rgba(75, 85, 99, 0.5)',
                    color: 'rgba(156, 163, 175, 0.5)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Box>
          )}

          {/* Signature Pad Dialog */}
          <Dialog 
            open={showSignaturePad} 
            onClose={() => setShowSignaturePad(false)} 
            maxWidth="sm" 
            fullWidth
            sx={{
              '& .MuiDialog-paper': {
                background: 'rgba(31, 41, 55, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(156, 163, 175, 0.2)',
              }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}>
              Digital Signature
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                Please sign below to confirm your agreement to this contract.
              </Typography>
              <Box
                sx={{
                  border: '2px dashed rgba(168, 85, 247, 0.3)',
                  borderRadius: '0.5rem',
                  height: 200,
                  background: 'rgba(255, 255, 255, 0.95)',
                  overflow: 'hidden'
                }}
              >
                <SignaturePad
                  ref={signaturePadRef}
                  canvasProps={{ 
                    width: 500, 
                    height: 200, 
                    style: { width: '100%', height: 200 } 
                  }}
                  backgroundColor="rgba(255, 255, 255, 0.95)"
                  penColor="#1f2937"
                />
              </Box>
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  onClick={clearSignature}
                  sx={{ color: '#9ca3af', borderColor: '#6b7280' }}
                >
                  Clear Signature
                </Button>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={() => setShowSignaturePad(false)}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={submitSignature}
                sx={{ minWidth: 140 }}
              >
                Sign Contract
              </Button>
            </DialogActions>
          </Dialog>
        </Container>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </ThemeProvider>
  );
}

export default ChatRoom;