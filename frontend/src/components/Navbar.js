import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home, AlertCircle, Wallet, User, Building2, BarChart3 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-primary text-white shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
            <span className="text-3xl">🧠</span>
            <span>Smart Hostel</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-purple-200 transition">Home</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-purple-200 transition flex items-center space-x-1">
                  <Home size={18} />
                  <span>Dashboard</span>
                </Link>
                {(user.role === 'admin' || user.role === 'management') && (
                  <Link to="/admin-dashboard" className="hover:text-purple-200 transition flex items-center space-x-1">
                    <Building2 size={18} />
                    <span>{user.role === 'admin' ? 'Admin' : 'Hostel Ops'}</span>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/management-dashboard" className="hover:text-purple-200 transition flex items-center space-x-1">
                    <BarChart3 size={18} />
                    <span>Analytics</span>
                  </Link>
                )}
                <Link to="/complaints" className="hover:text-purple-200 transition flex items-center space-x-1">
                  <AlertCircle size={18} />
                  <span>Complaints</span>
                </Link>
                <Link to="/payments" className="hover:text-purple-200 transition flex items-center space-x-1">
                  <Wallet size={18} />
                  <span>Payments</span>
                </Link>
                <Link to="/profile" className="hover:text-purple-200 transition flex items-center space-x-1">
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition flex items-center space-x-1"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
                  Login
                </Link>
                <Link to="/register" className="bg-purple-400 hover:bg-purple-500 px-4 py-2 rounded-lg transition">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block px-4 py-2 hover:bg-purple-500 rounded">Home</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="block px-4 py-2 hover:bg-purple-500 rounded">Dashboard</Link>
                {(user.role === 'admin' || user.role === 'management') && <Link to="/admin-dashboard" className="block px-4 py-2 hover:bg-purple-500 rounded">{user.role === 'admin' ? 'Admin' : 'Hostel Ops'}</Link>}
                {user.role === 'admin' && <Link to="/management-dashboard" className="block px-4 py-2 hover:bg-purple-500 rounded">Analytics</Link>}
                <Link to="/complaints" className="block px-4 py-2 hover:bg-purple-500 rounded">Complaints</Link>
                <Link to="/payments" className="block px-4 py-2 hover:bg-purple-500 rounded">Payments</Link>
                <Link to="/profile" className="block px-4 py-2 hover:bg-purple-500 rounded">Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 bg-red-500 hover:bg-red-600 rounded">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 hover:bg-purple-500 rounded">Login</Link>
                <Link to="/register" className="block px-4 py-2 hover:bg-purple-500 rounded">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
