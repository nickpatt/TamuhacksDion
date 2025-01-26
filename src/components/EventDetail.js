import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEvent, deleteEvent } from '../firebase';
import { useAuth } from '../context/AuthContext';

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await getEvent(eventId);
        if (!eventData) {
          setError('Event not found');
          return;
        }
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteEvent(eventId);
      if (result.success) {
        navigate('/events');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimeRange = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatTime = (date) => {
      return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
    };

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    };

    if (start.toDateString() === end.toDateString()) {
      return (
        <div className="space-y-1">
          <div className="font-medium">{formatDate(start)}</div>
          <div>
            {formatTime(start)} - {formatTime(end)}
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-1">
          <div className="font-medium">{formatDate(start)}</div>
          <div>
            {formatTime(start)} - {formatTime(end)} <span className="text-sm text-gray-500">(next day)</span>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/events"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          ← Back to Events
        </Link>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/events"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          ← Back to Events
        </Link>
        <div className="text-center p-4 text-red-600 bg-red-50 rounded-md">
          {error || 'Event not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/events"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
        >
          ← Back to Events
        </Link>
        {user && event?.createdBy?.uid === user.uid && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Event'}
          </button>
        )}
      </div>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {event.imageUrl && (
          <div className="w-full h-96 relative">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {event.title}
            </h1>
            <div className="text-sm text-gray-500">
              Organized by {event.createdBy?.username || 'Anonymous'}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {event.type}
            </span>
            <div className="text-gray-500">
              {formatTimeRange(event.startTime, event.endTime)}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Location</h2>
            <p className="text-gray-600">{event.location}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail; 