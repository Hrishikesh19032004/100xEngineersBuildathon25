// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Navbar, Container, Nav, Button } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const AppNavbar = () => {
//   const { currentUser, logout, loading } = useAuth();

//   const renderDashboardLink = () => {
//     if (loading || !currentUser) return null;
    
//     if (currentUser.type === 'Business') {
//       return <Nav.Link as={Link} to="/business/profile">Dashboard</Nav.Link>;
//     } else if (currentUser.type === 'Creator') {
//       return <Nav.Link as={Link} to="/creator/profile">Dashboard</Nav.Link>;
//     }
//     return null;
//   };

//   const renderAuthSection = () => {
//     if (loading) {
//       return (
//         <Nav className="ms-auto align-items-center">
//           <Navbar.Text className="text-white mx-2">
//             Loading...
//           </Navbar.Text>
//         </Nav>
//       );
//     }

//     return (
//       <Nav className="ms-auto align-items-center">
//         {currentUser ? (
//           <>
//             <Navbar.Text className="text-white mx-2">
//               {currentUser.name || currentUser.email || 'User'}
//             </Navbar.Text>
//             <Button
//               variant="outline-light"
//               onClick={logout}
//               className="mx-2"
//             >
//               Logout
//             </Button>
//           </>
//         ) : (
//           <>
//             <Button
//               as={Link}
//               to="/login"
//               variant="outline-light"
//               className="mx-2"
//             >
//               Login
//             </Button>
//             <Button
//               as={Link}
//               to="/signup"
//               variant="light"
//               className="mx-2"
//             >
//               Signup
//             </Button>
//           </>
//         )}
//       </Nav>
//     );
//   };

//   return (
//     <Navbar bg="dark" variant="dark" className="py-3 shadow-sm">
//       <Container>
//         <Navbar.Brand as={Link} to="/">AI Hack</Navbar.Brand>
//         <Nav className="me-auto">
//           <Nav.Link as={Link} to="/">Home</Nav.Link>
//           {renderDashboardLink()}
//         </Nav>
//         {renderAuthSection()}
//       </Container>
//     </Navbar>
//   );
// };

// export default AppNavbar;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const AppNavbar = () => {
  const { currentUser, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = () => {
    if (!currentUser) {
      return (
        <>
          <Link to="/login" className="hover:text-purple-400">
            Login
          </Link>
          <Link to="/signup" className="hover:text-purple-400">
            Signup
          </Link>
        </>
      );
    }

    if (currentUser.role === 'creator') {
      return (
        <>
          <Link to="/creator" className="hover:text-purple-400">
            Dashboard
          </Link>
        
          <button onClick={handleLogout} className="hover:text-red-400">
            Logout
          </button>
        </>
      );
    }

    if (currentUser.role === 'business') {
      return (
        <>
          <Link to="/business" className="hover:text-purple-400">
            Dashboard
          </Link>
          <Link to="/ytchecker" className="hover:text-purple-400">
            Creator Recommender
          </Link>
          <Link to="/recommender" className="hover:text-purple-400">
            Campaign
          </Link>
          <button onClick={handleLogout} className="hover:text-red-400">
            Logout
          </button>
        </>
      );
    }

    return null;
  };

  if (loading) return null;

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-purple-300">
          {!currentUser
            ? 'Abhigyan Setu'
            : currentUser.role === 'creator'
            ? 'Creator Abhigyan Setu'
            : 'Business Abhigyan Setu'}
        </Link>

        <div className="hidden md:flex gap-6 items-center">{navLinks()}</div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden mt-3 flex flex-col gap-4 px-2">
          {navLinks()}
        </div>
      )}
    </nav>
  );
};

export default AppNavbar;
