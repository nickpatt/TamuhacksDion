import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { signOutUser } from '../firebase';

const eventTypes = [
  { id: 'all', name: 'All Events' },
  { id: 'party', name: 'Parties' },
  { id: 'career', name: 'Career' },
  { id: 'food', name: 'Food' },
  { id: 'social', name: 'Social' },
  { id: 'academic', name: 'Academic' },
];

function Navbar() {
  const navigate = useNavigate();
  const { setActiveFilter } = useEvents();
  const { user } = useAuth();
  const [selected, setSelected] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFilterChange = (typeId) => {
    setSelected(typeId);
    setActiveFilter(typeId);
  };

  const handleSignOut = async () => {
    try {
      const result = await signOutUser();
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-black shadow-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <img
                src="https://placehold.co/40x40" // Replace with your actual logo
                alt="Dion Logo"
                className="h-10 w-10 rounded-full"
              />
              <Link to="/events" className="text-xl font-bold text-white hover:text-maroon-300">
                Dion - College Events
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/events/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-elegant text-white bg-maroon-500 hover:bg-maroon-600 transition-colors duration-200"
            >
              Post Event
            </Link>
            
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 text-white hover:text-maroon-300"
              >
                <span>{user?.displayName}</span>
                <span className="text-xs">▼</span>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleFilterChange('my-events');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-maroon-900"
                    >
                      My Events
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-maroon-900"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-maroon-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3">
            {eventTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleFilterChange(type.id)}
                className={`${
                  selected === type.id
                    ? 'text-maroon-500 border-maroon-500'
                    : 'text-gray-300 border-transparent hover:text-maroon-300 hover:border-maroon-300'
                } border-b-2 px-1 pb-3 text-sm font-medium`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 