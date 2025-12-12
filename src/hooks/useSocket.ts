import { useEffect, useState, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';

export const useSocket = (onMessage: (data: any) => void) => {
    const [isConnected, setIsConnected] = useState(false);
    
    // Use a ref to store the latest handler. 
    // This allows the socket to call the LATEST app logic 
    // without needing to disconnect/reconnect every render.
    const messageHandlerRef = useRef(onMessage);

    // Update ref whenever parent passes a new handler
    useEffect(() => {
        messageHandlerRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        connectSocket(
            (data) => {
                // Always call the most current function
                if (messageHandlerRef.current) {
                    messageHandlerRef.current(data);
                }
            },
            (status) => setIsConnected(status)
        );

        return () => {
            disconnectSocket();
            setIsConnected(false);
        };
    }, []); // Empty dependency array = Only connect ONCE on mount

    return isConnected;
};