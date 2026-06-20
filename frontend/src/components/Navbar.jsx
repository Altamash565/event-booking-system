import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="flex justify-between items-center h-16 px-4 md:px-8 max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-bold tracking-tight text-foreground no-underline">
          🎬 SortMyScene
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Events
          </Link>
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Hi, <strong className="text-foreground">{user.username}</strong>
              </span>
              <button 
                onClick={handleLogout} 
                className="text-sm text-muted-foreground hover:text-foreground border border-border px-4 py-1.5 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
