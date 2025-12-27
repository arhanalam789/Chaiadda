import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinAdmin = () => {
    if (socket) {
      socket.emit('joinAdmin');
    }
  };

  const joinUser = (userId) => {
    if (socket) {
      socket.emit('joinUser', userId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinAdmin, joinUser }}>
      {children}
    </SocketContext.Provider>
  );
};
