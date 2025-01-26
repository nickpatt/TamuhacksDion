import { createContext, useContext, useState } from 'react';

const EventContext = createContext();

export function EventProvider({ children }) {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <EventContext.Provider value={{ activeFilter, setActiveFilter }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventContext);
} 