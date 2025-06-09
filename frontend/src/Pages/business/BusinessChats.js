// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';
// import { MessageSquareText } from 'lucide-react';

// export default function BusinessChats() {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const { user } = useAuth();

//   useEffect(() => {
//     const fetchChats = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/business/chats', {
//           headers: { Authorization: `Bearer ${user.token}` }
//         });
//         setChats(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to load chats');
//         setLoading(false);
//       }
//     };

//     fetchChats();
//   }, [user.token]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
//         <p className="text-lg text-gray-400">Loading chats...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center">
//         <p>{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-10 text-center">
//           <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg mb-4">
//             <MessageSquareText className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold mb-2">Your Conversations</h1>
//           <p className="text-gray-400">View and continue your chats with creators</p>
//         </div>

//         {chats.length === 0 ? (
//           <div className="bg-gray-800/50 border border-gray-700 backdrop-blur-md p-10 rounded-2xl shadow-lg text-center max-w-xl mx-auto">
//             <div className="text-5xl mb-4">💬</div>
//             <h2 className="text-2xl font-semibold mb-2 text-white">No Active Chats</h2>
//             <p className="text-gray-400 mb-6">
//               You haven't initiated any conversations with creators yet.
//             </p>
//             <Link
//               to="/business/dashboard"
//               className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300"
//             >
//               Browse Creators
//             </Link>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {chats.map(chat => (
//               <Link
//                 key={chat.session_id}
//                 to={`/chat/${chat.session_id}`}
//                 className="bg-gray-800/50 border border-gray-700 backdrop-blur-md rounded-xl p-6 shadow-lg hover:scale-105 transition-transform block"
//               >
//                 <div className="flex items-center">
//                   <div className="relative">
//                     <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/20 flex-shrink-0 flex items-center justify-center">
//                       <span className="text-xl font-bold text-purple-300">
//                         {chat.name?.charAt(0)?.toUpperCase() || 'C'}
//                       </span>
                      
//                       {/* Position indicator */}
//                       <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-800 ${
//                         chat.last_position === 'right' 
//                           ? 'bg-green-500' 
//                           : 'bg-blue-500'
//                       }`}></div>
//                     </div>
//                   </div>
//                   <div className="ml-4 overflow-hidden">
//                     <h2 className="text-lg font-semibold text-white truncate">{chat.name}</h2>
//                     <p className="text-purple-400 text-sm">@{chat.channel_name}</p>
//                     <p className="text-gray-400 text-sm mt-1 truncate">
//                       {chat.last_position === 'right' ? (
//                         <span className="text-purple-300">You: </span>
//                       ) : (
//                         <span className="text-blue-300">{chat.name.split(' ')[0]}: </span>
//                       )}
//                       {chat.last_message || 'New chat started'}
//                     </p>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// // import React, { useState, useEffect } from 'react';
// // import { Link } from 'react-router-dom';
// // import axios from 'axios';
// // import { useAuth } from '../../context/AuthContext';
// // import { MessageSquareText } from 'lucide-react';

// // export default function BusinessChats() {
// //   const [chats, setChats] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState('');
// //   const { user } = useAuth();

// //   useEffect(() => {
// //     const fetchChats = async () => {
// //       try {
// //         const response = await axios.get('http://localhost:5000/api/business/chats', {
// //           headers: { Authorization: `Bearer ${user.token}` }
// //         });
// //         setChats(response.data);
// //         setLoading(false);
// //       } catch (err) {
// //         setError('Failed to load chats');
// //         setLoading(false);
// //       }
// //     };

// //     fetchChats();
// //   }, [user.token]);

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
// //         <p className="text-lg text-gray-400">Loading chats...</p>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center">
// //         <p>{error}</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
// //       <div className="max-w-7xl mx-auto">
// //         <div className="mb-10 text-center">
// //           <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg mb-4">
// //             <MessageSquareText className="w-8 h-8 text-white" />
// //           </div>
// //           <h1 className="text-3xl font-bold mb-2">Your Conversations</h1>
// //           <p className="text-gray-400">View and continue your chats with creators</p>
// //         </div>

// //         {chats.length === 0 ? (
// //           <div className="bg-gray-800/50 border border-gray-700 backdrop-blur-md p-10 rounded-2xl shadow-lg text-center max-w-xl mx-auto">
// //             <div className="text-5xl mb-4">💬</div>
// //             <h2 className="text-2xl font-semibold mb-2 text-white">No Active Chats</h2>
// //             <p className="text-gray-400 mb-6">
// //               You haven't initiated any conversations with creators yet.
// //             </p>
// //             <Link
// //               to="/business/dashboard"
// //               className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300"
// //             >
// //               Browse Creators
// //             </Link>
// //           </div>
// //         ) : (
// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //             {chats.map(chat => (
// //               <Link
// //                 key={chat.session_id}
// //                 to={`/chat/${chat.session_id}`}
// //                 className="bg-gray-800/50 border border-gray-700 backdrop-blur-md rounded-xl p-6 shadow-lg hover:scale-105 transition-transform block"
// //               >
// //                 <div className="flex items-center">
// //                   <div className="w-16 h-16 rounded-xl bg-gray-700 border-2 border-dashed flex-shrink-0" />
// //                   <div className="ml-4 overflow-hidden">
// //                     <h2 className="text-lg font-semibold text-white truncate">{chat.name}</h2>
// //                     <p className="text-purple-400 text-sm">@{chat.channel_name}</p>
// //                     <p className="text-gray-400 text-sm mt-1 truncate">
// //                       {chat.last_message || 'New chat started'}
// //                     </p>
// //                   </div>
// //                 </div>
// //               </Link>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { MessageSquareText } from 'lucide-react';

export default function BusinessChats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Fetch creators you've previously chatted with
        const response = await axios.get('http://localhost:5000/api/creators', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        // Format the chat data with ZegoCloud session IDs
        const formattedChats = response.data.map(creator => ({
          creator_id: creator.id,
          name: creator.name,
          channel_name: creator.channel_name,
          session_id: `business_${user.id}_creator_${creator.id}`
        }));
        
        setChats(formattedChats);
        setLoading(false);
      } catch (err) {
        setError('Failed to load creators');
        setLoading(false);
      }
    };

    fetchChats();
  }, [user.token, user.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-lg text-gray-400">Loading creators...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg mb-4">
            <MessageSquareText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Creators</h1>
          <p className="text-gray-400">Chat with creators you've connected with</p>
        </div>

        {chats.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 backdrop-blur-md p-10 rounded-2xl shadow-lg text-center max-w-xl mx-auto">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold mb-2 text-white">No Creators Yet</h2>
            <p className="text-gray-400 mb-6">
              You haven't connected with any creators yet.
            </p>
            <Link
              to="/business/dashboard"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300"
            >
              Browse Creators
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chats.map(chat => (
              <Link
                key={chat.session_id}
                to={`/chat/${chat.session_id}`}
                className="bg-gray-800/50 border border-gray-700 backdrop-blur-md rounded-xl p-6 shadow-lg hover:scale-105 transition-transform block"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/20 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-purple-300">
                        {chat.name?.charAt(0)?.toUpperCase() || 'C'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div className="ml-4 overflow-hidden">
                    <h2 className="text-lg font-semibold text-white truncate">{chat.name}</h2>
                    <p className="text-purple-400 text-sm">@{chat.channel_name}</p>
                    <p className="text-gray-400 text-sm mt-1 truncate">
                      Click to start chatting
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}