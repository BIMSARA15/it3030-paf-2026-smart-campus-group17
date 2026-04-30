// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { getUserNotifications } from '../services/api'; 

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    // 1. Extract the ID OUTSIDE the useEffect
    const activeId = user?.id || user?._id || user?.userId;

    useEffect(() => {
        // 2. Abort if no ID is found yet
        if (!activeId) return;

        const fetchInitial = async () => {
            try {
                const data = await getUserNotifications();
                setNotifications(data);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };
        fetchInitial();

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                client.subscribe(`/topic/notifications/${activeId}`, (message) => {
                    const newNotif = JSON.parse(message.body);
                    setNotifications((prev) => [newNotif, ...prev]);
                });
            }
        });
        
        client.activate();
        
        // 3. Cleanup function
        return () => {
            client.deactivate();
        };
    }, [activeId]); // <--- CRITICAL FIX: We now depend ONLY on activeId, not the whole user object

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, setNotifications, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext);