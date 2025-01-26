import { useState, useEffect } from 'react';
import { useEvents } from '../context/EventContext';
import { fetchEvents, deleteAllEvents } from '../firebase';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeFilter } = useEvents();
  const { user } = useAuth();

  useEffect(() => {
    const getEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching events for filter:', activeFilter);
        const eventList = await fetchEvents(activeFilter);
        setEvents(eventList);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, [activeFilter]); // This will re-fetch when activeFilter changes

  const formatTimeRange = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatTime = (date) => {
      return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toLowerCase(); // Makes it lowercase for consistency
    };

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    };

    // Check if the event is on the same day
    if (start.toDateString() === end.toDateString()) {
      return (
        <div className="space-y-1">
          <div className="font-medium">{formatDate(start)}</div>
          <div className="text-gray-500">
            {formatTime(start)} - {formatTime(end)}
          </div>
        </div>
      );
    } else {
      // For events spanning multiple days
      return (
        <div className="space-y-1">
          <div className="font-medium">
            {formatDate(start)}
          </div>
          <div className="text-gray-500">
            {formatTime(start)} - {formatTime(end)} <span className="text-xs">(next day)</span>
          </div>
        </div>
      );
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL events? This cannot be undone!')) {
      try {
        await deleteAllEvents();
        window.location.reload();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">
          {activeFilter === 'all' 
            ? 'No events found.' 
            : `No ${activeFilter} events found.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Link
          key={event.id}
          to={`/events/${event.id}`}
          className="block transform transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="relative bg-gradient-to-b from-black to-maroon-900 text-white overflow-hidden rounded-xl shadow-card hover:shadow-hover border border-maroon-800">
            {event.imageUrl && (
              <div className="w-full h-48 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6 text-center relative">
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-lg font-medium text-white">{event.title}</h3>
                {user && event.createdBy?.uid === user.uid && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-maroon-500 text-white shadow-elegant">
                    Your Event
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-300 line-clamp-2">
                {event.description}
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex flex-col items-center space-y-2">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-maroon-500 text-white shadow-elegant">
                    {event.type}
                  </span>
                  <span className="text-sm text-gray-300">
                    by {event.createdBy?.username || 'Anonymous'}
                  </span>
                </div>
                <div className="text-sm text-gray-200 bg-maroon-900/50 rounded-lg p-3 shadow-inner">
                  {formatTimeRange(event.startTime, event.endTime)}
                </div>
                <p className="text-sm text-gray-300 bg-black/30 rounded-lg p-2">
                  {event.location}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-maroon-900/20 to-transparent pointer-events-none" />
          </div>
        </Link>
      ))}
      <button 
        onClick={handleDeleteAll}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Delete All Events
      </button>
    </div>
  );
}

export default EventList; 