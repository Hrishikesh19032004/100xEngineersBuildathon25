// import logo from './logo.svg';
// import './App.css';
// import {Navbar} from './Components/Navbar';
// import { useState,  } from 'react';
// import Home from './Pages/Home';
// // import Login from './Pages/Login';
// // import Contact from './Pages/Contact';
// // import Footer from './Components/Footer';


// // const App = () => {
// //   return (
 
// //       <div className="App">
// //         <Navbar />
// //         <Routes>
// //           <Route path="/" element={<Home />} />
// //           <Route path="/login" element={<Login />} />
// //           <Route path="/contact" element={<Contact />} />
// //         </Routes>
// //         <Footer/>
// //       </div>

// //   );
// // };

// // export default App;



// // File: src/App.js
// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import BusinessRegister from './pages/business/BusinessRegister';
// import BusinessLogin from './pages/business/BusinessLogin';
// import CreatorRegister from './pages/creator/CreatorRegister';
// import CreatorLogin from './pages/creator/CreatorLogin';
// import BusinessDashboard from './pages/business/BusinessDashboard';
// import CreatorDashboard from './pages/creator/CreatorDashboard';
// import CreatorProfile from './pages/creator/CreatorProfile';
// import BusinessChats from './pages/business/BusinessChats';
// import Chat from './pages/common/Chat';
// import Layout from './components/Layout';
// import { useAuth } from './context/AuthContext';

// function App() {
//   const { user, loading } = useAuth();
  
//   if (loading) {
//     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
//   }
  
//   return (
//     <>
//     <Navbar />
//     <Routes>
//       {/* Public Routes */}
//       <Route path="/business/register" element={<BusinessRegister />} />
//       <Route path="/business/login" element={<BusinessLogin />} />
//       <Route path="/creator/register" element={<CreatorRegister />} />
//       <Route path="/creator/login" element={<CreatorLogin />} />
      
//       {/* Protected Routes */}
//       <Route element={<Layout />}>
//         {/* Business Routes */}
//         <Route 
//           path="/business/dashboard" 
//           element={user?.type === 'business' ? <BusinessDashboard /> : <Navigate to="/business/login" />} 
//         />
//         <Route 
//           path="/business/chats" 
//           element={user?.type === 'business' ? <BusinessChats /> : <Navigate to="/business/login" />} 
//         />
        
//         {/* Creator Routes */}
//         <Route 
//           path="/creator/dashboard" 
//           element={user?.type === 'creator' ? <CreatorDashboard /> : <Navigate to="/creator/login" />} 
//         />
//         <Route 
//           path="/creator/profile" 
//           element={user?.type === 'creator' ? <CreatorProfile /> : <Navigate to="/creator/login" />} 
//         />
        
//         {/* Common Routes */}
//         <Route 
//           path="/chat/:sessionId" 
//           element={user ? <Chat /> : <Navigate to="/" />} 
//         />
//       </Route>
      
//       {/* Default Redirect */}
//       <Route path="/" element={<Navigate to={user?.type === 'business' ? "/business/dashboard" : "/creator/dashboard"} />} />
//       <Route path="*" element={<Navigate to={user?.type === 'business' ? "/business/dashboard" : "/creator/dashboard"} />} />
//     </Routes>
//     </>
//   );
// }

// export default App;

// File: src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BusinessRegister from './pages/business/BusinessRegister';
import BusinessLogin from './pages/business/BusinessLogin';
import CreatorRegister from './pages/creator/CreatorRegister';
import CreatorLogin from './pages/creator/CreatorLogin';
import BusinessDashboard from './pages/business/BusinessDashboard';
import CreatorDashboard from './pages/creator/CreatorDashboard';
import CreatorProfile from './pages/creator/CreatorProfile';
import BusinessChats from './pages/business/BusinessChats';
import Chat from './pages/common/Chat';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
// Added imports from your original code
import {Navbar} from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Contact from './pages/Contact';

function App() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <>
    <Navbar />
    <Routes>
      {/* Home page as main route */}
      <Route path="/" element={<Home />} />
      {/* <Route path="/login" element={<Login />} /> */}
      <Route path="/contact" element={<Contact />} />
      
      {/* Public Routes */}
      <Route path="/business/register" element={<BusinessRegister />} />
      <Route path="/business/login" element={<BusinessLogin />} />
      <Route path="/creator/register" element={<CreatorRegister />} />
      <Route path="/creator/login" element={<CreatorLogin />} />
      
      {/* Protected Routes */}
      <Route element={<Layout />}>
        {/* Business Routes */}
        <Route 
          path="/business/dashboard" 
          element={user?.type === 'business' ? <BusinessDashboard /> : <Navigate to="/business/login" />} 
        />
        <Route 
          path="/business/chats" 
          element={user?.type === 'business' ? <BusinessChats /> : <Navigate to="/business/login" />} 
        />
        
        {/* Creator Routes */}
        <Route 
          path="/creator/dashboard" 
          element={user?.type === 'creator' ? <CreatorDashboard /> : <Navigate to="/creator/login" />} 
        />
        <Route 
          path="/creator/profile" 
          element={user?.type === 'creator' ? <CreatorProfile /> : <Navigate to="/creator/login" />} 
        />
        
        {/* Common Routes */}
        <Route 
          path="/chat/:sessionId" 
          element={user ? <Chat /> : <Navigate to="/" />} 
        />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </>
  );
}

export default App;