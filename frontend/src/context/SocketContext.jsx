'use client';

import React, { createContext, useContext, useState } from 'react';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [connected] = useState(true); // Always true since we rely on REST API polling now

  const joinOrderRoom = () => {}; // Stub to prevent crashes
  const joinAdminRoom = () => {}; // Stub to prevent crashes

  return (
    <SocketContext.Provider value={{ socket: null, connected, joinOrderRoom, joinAdminRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

