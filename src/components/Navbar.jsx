
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-primary font-bold text-xl md:text-2xl">FoodLoop</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated() ? (
            <>
              <span className="hidden md:inline text-gray-700">
                Hello, {user?.email?.split('@')[0]}
              </span>
              
              {user?.roles?.includes('Retailer') && (
                <>
                  <Link to="/retailer/dashboard">
                    <Button variant="ghost">Inventory</Button>
                  </Link>
                  <Link to="/retailer/requests">
                    <Button variant="ghost">Requests</Button>
                  </Link>
                </>
              )}
              
              {user?.roles?.includes('Ngo') && (
                <>
                  <Link to="/ngo/dashboard">
                    <Button variant="ghost">Available Food</Button>
                  </Link>
                  <Link to="/ngo/requests">
                    <Button variant="ghost">My Requests</Button>
                  </Link>
                </>
              )}
              
              {user?.roles?.includes('Farmer') && (
                <Link to="/farmer/dashboard">
                  <Button variant="ghost">Demand Forecast</Button>
                </Link>
              )}
              
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
