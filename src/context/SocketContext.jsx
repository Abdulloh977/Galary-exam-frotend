import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // userId'lar ro'yxati

  useEffect(() => {
    if (!user) return;

    // Backend serverimizga ulanamiz
    const newSocket = io("http://localhost:4000");

    // Ulangandan so'ng, o'z ID'mizni serverga yuboramiz (onlaynligimizni bildirish uchun)
    newSocket.on("connect", () => {
      newSocket.emit("addUser", user._id);
    });

    newSocket.on("onlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user]);

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  );
};
